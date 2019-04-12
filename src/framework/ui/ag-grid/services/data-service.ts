import {Injectable} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {GridApi, IDatasource, IGetRowsParams} from 'ag-grid-community';
import {Observable, BehaviorSubject, Subject} from 'rxjs';
import {cloneDeep, get} from 'lodash';
import * as moment from 'moment';

import {UniTableColumn, UniTableColumnType, UniTableColumnSortMode} from '../../unitable/config/unitableColumn';
import {UniTableConfig} from '../../unitable/config/unitableConfig';
import {ITableFilter, IExpressionFilterValue} from '../interfaces';
import {StatisticsService} from '@app/services/common/statisticsService';
import {TableUtils} from './table-utils';

@Injectable()
export class TableDataService {
    private config: UniTableConfig;
    private gridApi: GridApi;
    private hasRemoteLookup: boolean;

    public sumRow$: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
    public totalRowCount$: BehaviorSubject<number> = new BehaviorSubject(0);
    public loadedRowCount: number;

    public basicSearchFilters: ITableFilter[];
    public advancedSearchFilters: ITableFilter[];
    public filterString: string;

    public columnSumResolver: (params: URLSearchParams) => Observable<{[field: string]: number}>;

    // Only maintained for local data grids!
    private originalData: any[];
    private viewData: any[];

    public localDataChange$: Subject<any[]> = new Subject();

    // Only maintained for inifinite scroll tables!
    private rowCountOnRemote: number;

    constructor(
        private statisticsService: StatisticsService,
        private utils: TableUtils
    ) {}

    public initialize(gridApi: GridApi, newConfig: UniTableConfig, resource) {
        this.gridApi = gridApi;

        const configFiltersChanged = this.didConfigFiltersChange(newConfig);
        const configChanged = !this.config || this.config.configStoreKey !== newConfig.configStoreKey;

        this.config = newConfig;

        if (configChanged) {
            this.filterString = undefined;
            const lastUsedFilters = this.utils.getLastUsedFilter(newConfig.configStoreKey);
            this.setFilters(lastUsedFilters || newConfig.filters, [], false);
        } else if (configFiltersChanged) {
            this.filterString = undefined;
            this.setFilters(newConfig.filters, [], false);
        }

        if (Array.isArray(resource)) {
            this.originalData = this.setMetadata(resource);
            // Don't filter locally when ticker grouping is on!
            const filteredData = this.config.isGroupingTicker ? this.originalData  : this.filterLocalData(this.originalData);
            this.loadedRowCount = filteredData.length;
            this.totalRowCount$.next(this.loadedRowCount);

            this.gridApi.setRowData(filteredData);
            this.gridApi.forEachNode(node => {
                if (node.data && node.data['_rowSelected']) {
                    node.setSelected(node.data['_rowSelected']);
                }
            });
            const lastRow = filteredData.length && filteredData[filteredData.length - 1];
            if (this.config.autoAddNewRow && this.config.editable && (!lastRow || !lastRow['_isEmpty'])) {
                this.addRow();
            }
        } else {
            this.hasRemoteLookup = true;
            this.loadedRowCount = 0;

            this.gridApi.setDatasource(this.getRemoteDatasource(resource));
        }

        // Get columns sums if working with local data.
        // Remote data column sums is handled in dataSource
        if (Array.isArray(resource)) {
            this.sumRow$.next(undefined);
            const sumColumns = this.config.columns.filter(col => col.isSumColumn || col.aggFunc);
            if (sumColumns.length) {
                this.getLocalDataColumnSums(sumColumns, resource);
            }
        }
    }

    private didConfigFiltersChange(newConfig) {
        let configFiltersChanged = false;
        const oldFilters = (this.config && this.config.filters) || [];
        const newFilters = (newConfig && newConfig.filters) || [];

        if (oldFilters.length !== newFilters.length) {
            configFiltersChanged = true;
        } else {
            // Check if there exists a filter in the new config that didn't exist  in the old.
            configFiltersChanged = newFilters.some(filter => {
                return !oldFilters.some(oldFilter => {
                    return oldFilter.field === filter.field
                        && oldFilter.operator === filter.operator
                        && oldFilter.value === filter.value;
                });
            });
        }

        return configFiltersChanged;
    }

    private setMetadata(data: any[], startIndex: number = 0): any[] {
        if (!data || !data.length) {
            return [];
        }

        data.forEach((row, index) => {
            row['_originalIndex'] = startIndex + index;
            row['_guid'] = this.getGuid();
        });

        return data;
    }

    private getRemoteDatasource(resource: (urlParam: URLSearchParams) => any): IDatasource {
        this.loadedRowCount = 0;
        return {
            getRows: (params: IGetRowsParams) => {
                const urlParams = new URLSearchParams();
                urlParams.set('skip', params.startRow.toString());
                urlParams.set('top', (params.endRow - params.startRow).toString());

                // Filtering
                if (this.filterString) {
                    urlParams.set('filter', this.filterString);
                }

                // Sorting
                let orderby;
                if (params.sortModel && params.sortModel.length) {
                    const sortModel = params.sortModel[0];
                    orderby = `${sortModel.colId} ${sortModel.sort}`;
                }

                if (orderby) {
                    urlParams.set('orderby', orderby);
                }

                resource(urlParams).subscribe(
                    res => {
                        let totalRowCount, data;
                        if (res.json) {
                            data = res.json();
                            totalRowCount = res.headers && res.headers.get('count');
                            this.totalRowCount$.next(totalRowCount);

                            if (data.Data) {
                                data.Data.forEach(item => {
                                    if (item.ID === 3223) {
                                        console.log({item});
                                    }
                                });
                            }
                            if (!totalRowCount) {
                                totalRowCount = data.length;
                            }
                        } else {
                            data = res;
                        }

                        // Dont update remote row count after first load (skip = 0)
                        // because statistics seems to subtract skip from the count
                        if (totalRowCount && params.startRow === 0) {
                            this.rowCountOnRemote = totalRowCount;
                        }

                        const unwrapped = data.Data ? data.Data : data;
                        const rows = this.setMetadata(unwrapped, this.loadedRowCount);
                        this.loadedRowCount = params.startRow + rows.length;

                        params.successCallback(rows, this.rowCountOnRemote);
                    },
                    err => {
                        console.error(err);
                        params.failCallback();
                    }
                );

                if (params.startRow === 0) {
                    this.sumRow$.next(undefined);

                    if (this.columnSumResolver) {
                        this.columnSumResolver(urlParams)
                            .catch(err => {
                                console.log('ERROR IN TABLE columnSumResolver', err);
                                this.sumRow$.next(undefined);
                                return Observable.empty();
                            })
                            .subscribe((sums: {[field: string]: number | boolean}) => {
                                if (sums) {
                                    sums['_isSumRow'] = true;
                                }

                                this.sumRow$.next([sums]);
                            });
                    } else {
                        const sumColumns = this.config.columns.filter(col => col.isSumColumn);
                        this.getRemoteDataColumnSums(sumColumns);
                    }
                }
            }
        };
    }

    public refreshData() {
        if (this.gridApi) {
            this.loadedRowCount = 0;

            if (this.gridApi.getSelectedRows().length) {
                this.gridApi.deselectAll();
            }

            if (this.hasRemoteLookup) {
                this.gridApi.refreshInfiniteCache();
            } else {
                this.viewData = this.filterLocalData(this.originalData);
                this.gridApi.setRowData(this.viewData);
                this.localDataChange$.next(this.originalData);

                // Re-calculate sum row if we have sum columns
                setTimeout(() => {
                    const sumColumns = this.config.columns.filter(col => col.isSumColumn || col.aggFunc);
                    if (sumColumns.length) {
                        const visibleData = [];
                        this.getLocalDataColumnSums(sumColumns, this.originalData);
                    }
                });
            }
        }
    }

    public clearEmptyRows() {
        this.originalData = this.originalData.filter(row => !row['_isEmpty']);
        this.refreshData();
    }

    public getViewData() {
        return this.viewData;
    }

    public getTableData(filterEmpty?: boolean) {
        return filterEmpty
            ? this.originalData.filter(row => !row._isEmpty)
            : this.originalData;
    }

    private getGuid(): string {
        // tslint:disable-next-line
        return(''+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    public deleteRow(row) {
        const originalIndex = row['_originalIndex'];

        if (row.ID) {
            this.originalData[originalIndex].Deleted = true;
            this.originalData[originalIndex]['_isDirty'] = true;
        } else {
            this.originalData.splice(originalIndex, 1);
            this.originalData.forEach((r, index) => r['_originalIndex'] = index);
        }

        if (this.originalData.length) {
            this.refreshData();
        } else if (this.config.autoAddNewRow) {
            this.addRow();
        }
    }

    public updateRow(originalIndex, row) {
        if (this.hasRemoteLookup) {
            console.warn('Updating rows not supported with remote lookup');
            return;
        }

        row['_isEmpty'] = false;
        this.originalData[originalIndex] = row;
        this.refreshData();
    }

    public addRow(rowData?: any) {
        if (this.hasRemoteLookup) {
            console.warn('Adding rows not supported with remote lookup');
            return;
        }

        let newRow = rowData;

        if (newRow) {
            newRow['_isEmpty'] = false;
        } else {
            newRow = this.config && this.config.defaultRowData
                ? this.config.defaultRowData
                : {};

            newRow['_isEmpty'] = true;
        }

        newRow = cloneDeep(newRow); // avoid multiple new rows having the same reference
        newRow['Deleted'] = false;
        newRow['_originalIndex'] = this.originalData.length;
        newRow['_guid'] = this.getGuid();

        this.originalData.push(newRow);
        this.refreshData();
    }

    public filterLocalData(originalData: any[]): any[] {
        if (!originalData || !originalData.length) {
            return [];
        }

        let data = cloneDeep(originalData).filter(row => !row.Deleted);

        // Advanced filters (separator = and)
        if (this.advancedSearchFilters && this.advancedSearchFilters.length) {
            const filterGroups = [];
            const ungroupedFilters = [];

            this.advancedSearchFilters.forEach(f => {
                if (f.group > 0) {
                    filterGroups[f.group] = filterGroups[f.group] || [];
                    filterGroups[f.group].push(f);
                } else {
                    ungroupedFilters.push(f);
                }
            });

            data = data.filter(item => {
                const ungroupedCheck = ungroupedFilters.every(filter => this.checkFilter(filter, item));
                const groupsCheck = filterGroups.every(group => {

                    // Filters inside a group are separated by 'or'
                    return group.some(filter => {
                        return this.checkFilter(filter, item);
                    });
                });

                return ungroupedCheck && groupsCheck;
            });
        }

        // Basic filters (separator = or)
        if (this.basicSearchFilters && this.basicSearchFilters.length) {
            data = data.filter(item => {
                return this.basicSearchFilters.some(filter => {
                    return this.checkFilter(filter, item);
                });
            });
        }

        return data;
    }

    public checkFilter(filter: ITableFilter, item): boolean {
        const query = this.getFilterValueFromFilter(filter, this.config.expressionFilterValues).toLowerCase();
        const value = (get(item, filter.field) || '').toString().toLowerCase();

        if (!query || !query.length) {
            return true;
        }

        if (filter.isDate) {
            return this.checkDateFilter(query, value, filter.operator);
        }

        const isNumber = (val) => !isNaN(value) && isFinite(value);

        switch (filter.operator) {
            case 'contains':
                return value.indexOf(query) >= 0;
            case 'startswith':
                return value.indexOf(query) === 0;
            case 'endswith':
                return value.indexOf(query) === (value.length - query.length);
            case 'eq':
                return value === query;
            case 'ne':
                return value !== query;
            case 'gt':
                if (!isNumber(value) || !isNumber(query)) {
                    return false;
                }
                return parseInt(value, 10) > parseInt(query, 10);
            case 'lt':
                if (!isNumber(value) || !isNumber(query)) {
                    return false;
                }
                return parseInt(value, 10) < parseInt(query, 10);
            case 'ge':
                if (!isNumber(value) || !isNumber(query)) {
                    return false;
                }
                return parseInt(value, 10) >= parseInt(query, 10);
            case 'le':
                if (!isNumber(value) || !isNumber(query)) {
                    return false;
                }
                return parseInt(value, 10) <= parseInt(query, 10);
        }
    }

    private checkDateFilter(query: string, value: string, operator) {
        const queryMoment = moment(query);
        const valueMoment = moment(value);

        if (!valueMoment.isValid()) {
            return false;
        }

        switch (operator) {
            case 'contains':
                return valueMoment.format('DD.MM.YYYY').includes(query);
            case 'startswith':
                return valueMoment.format('DD.MM.YYYY').startsWith(query);
            case 'endswith':
                return valueMoment.format('DD.MM.YYYY').endsWith(query);
            case 'eq':
                return queryMoment.format('DD.MM.YYYY') === valueMoment.format('DD.MM.YYYY');
            case 'ne':
                return queryMoment.format('DD.MM.YYYY') !== valueMoment.format('DD.MM.YYYY');
            case 'gt':
                return valueMoment.isAfter(queryMoment.add(1, 'days'));
            case 'ge':
                return valueMoment.isAfter(queryMoment);
            case 'lt':
                return valueMoment.isBefore(queryMoment);
            case 'le':
                return valueMoment.isBefore(queryMoment.add(1, 'days'));
        }
    }

    public setFilters(
        advancedSearchFilters: ITableFilter[] = [],
        basicSearchFilters: ITableFilter[] = [],
        refreshTableData: boolean = true
    ): any {
        // Dont use filters that are missing field or operator.
        // This generally means the user is not done creating them yet
        advancedSearchFilters = advancedSearchFilters.filter(f => !!f.field && !!f.operator);
        basicSearchFilters = basicSearchFilters.filter(f => !!f.field && !!f.operator);

        // Make sure date filters are correctly marked (for date autocompletion)
        advancedSearchFilters = advancedSearchFilters.map(filter => {
            const col = this.config.columns.find(c => c.field === filter.field);

            filter.isDate = !!col && (
                col.type === UniTableColumnType.DateTime
                || col.type === UniTableColumnType.LocalDate
            );

            return filter;
        });


        // Sort advanced filters by group
        advancedSearchFilters = advancedSearchFilters.sort((a, b) => a.group - b.group);

        this.advancedSearchFilters = advancedSearchFilters;
        this.basicSearchFilters = basicSearchFilters;

        let filterStrings: string[] = [];
        if (this.basicSearchFilters && this.basicSearchFilters.length) {
            filterStrings.push(this.getFilterString(this.basicSearchFilters, this.config.expressionFilterValues, 'or'));
        }

        if (this.advancedSearchFilters && this.advancedSearchFilters.length) {
            filterStrings.push(this.getFilterString(this.advancedSearchFilters, this.config.expressionFilterValues));
        }

        filterStrings = filterStrings.filter(res => res !== '');

        this.filterString = filterStrings.join(' and ');

        if (refreshTableData) {
            this.refreshData();
        } else {
            return this.filterString;
        }
    }

    public removeFilter(field: string): void {
        if (!this.advancedSearchFilters) {
            return;
        }

        const advancedFilters = this.advancedSearchFilters.filter(f => f.field !== field);
        this.setFilters(advancedFilters, this.basicSearchFilters);
    }

    public getFilterString(filters: ITableFilter[], expressionFilterValues: IExpressionFilterValue[], separator?): string {
        if (!filters || !filters.length) {
            return '';
        }

        let filterString = '';
        let lastFilterGroup = 0;
        let isInGroup = false;

        filters.forEach((filter, index) => {
            const filterValue = this.getFilterValueFromFilter(filter, expressionFilterValues);
            if (filterValue) {
                // close last filtergroup (if any)
                if (lastFilterGroup.toString() !== (filter.group || 0).toString() && lastFilterGroup > 0) {
                    filterString += ' )';
                    isInGroup = false;
                }

                // use "or" if filter is in a group, otherwise use the specified separator (usually "and")
                if (index > 0 && isInGroup) {
                    filterString += ' or ';
                } else if (index > 0) {
                    filterString += ' ' + (separator ? separator : 'and') + ' ';
                }

                // open new filter group with parenthesis
                if (!isInGroup && filter.group > 0) {
                    filterString += '(';
                    lastFilterGroup = filter.group || 0;
                    isInGroup = true;
                }

                if (filter.operator === 'contains' || filter.operator === 'startswith' || filter.operator === 'endswith') {
                    // Function operator
                    filterString += (`${filter.operator}(${filter.field},'${filterValue}')`);
                } else {
                    // Logical operator
                    filterString += `${this.getFieldValue(filter.field, filter.operator)} ${filter.operator} '${filterValue}'`;
                }
            }
        });

        // close last group if we are in a group
        if (isInGroup) {
            filterString += ' )';
        }

        if (filterString !== '') {
            filterString = `( ${filterString} )`;
        }

        return filterString;
    }

    private getFieldValue(field, operator) {
        if (operator === 'ne' && field.toLocaleLowerCase().includes('statuscode')) {
            return `isnull(${field},0)`;
        } else {
            return field;
        }
    }

    private getFilterValueFromFilter(filter: ITableFilter, expressionFilterValues: IExpressionFilterValue[]): string {
        let filterValue = filter.value.toString() || '';

        if (filter.isDate) {
            let filterMoment;

            // Try parsing date strings with norwegian format first
            if (typeof filter.value === 'string') {
                filterMoment = moment(filter.value, 'DD.MM.YYYY');
            }

            // If the above failed, or the filter value is a date object
            // try parsing it without a specified format
            if (!filterMoment || !filterMoment.isValid()) {
                filterMoment = moment(filter.value);
            }

            // If the result is a valid date, format for use in http filter
            if (filterMoment.isValid()) {
                filterValue = filterMoment.format('YYYY-MM-DD');
            }
        }

        // If expressionfiltervalues are defined, e.g. ":currentuserid",
        // check if any of the defined filters should inject the expressionfiltervalue
        if (filterValue.toString().startsWith(':')) {
            const expressionFilterValue = expressionFilterValues.find(efv => ':' + efv.expression === filterValue);

            if (expressionFilterValue) {
                filterValue = expressionFilterValue.value || '';
            } else {
                console.error('No ExpressionFilterValue defined for filterexpression ' + filterValue);
            }
        }

        return filterValue.toString();
    }

    private getLocalDataColumnSums(sumColumns: UniTableColumn[], data: any[]) {
        const sumRow: any = {};
        sumRow._isSumRow = true;

        sumColumns.forEach((col, index) => {
            // TODO: filteredData
            sumRow[col.alias || col.field] = col.aggFunc
                ? col.aggFunc(data)
                : data.reduce((sum, row) => {
                    return sum += parseFloat(get(row, col.alias || col.field, 0)) || 0;
                }, 0);
        });

        this.sumRow$.next([sumRow]);
    }

    private getRemoteDataColumnSums(sumColumns: UniTableColumn[]) {
        if (!this.config.entityType || !sumColumns || !sumColumns.length) {
            return;
        }

        const sumSelects = [];
        sumColumns.forEach((col, index) => {
            col['_selectAlias'] = 'sum' + index;
            sumSelects.push(`sum(${col.field}) as ${col['_selectAlias']}`);
        });

        let odata = `model=${this.config.entityType}&select=${sumSelects.join(',')}`;

        if (this.filterString) {
            odata += `&filter=${this.filterString}`;
        }

        this.statisticsService.GetAll(odata)
            .map(res => (res && res.Data && res.Data[0]) || {})
            .catch(err => {
                this.sumRow$.next(undefined);
                return Observable.empty();
            })
            .subscribe(sums => {
                const sumRow: any = {};
                sumRow._isSumRow = true;
                sumColumns.forEach(col => {
                    sumRow[col.alias || col.field] = sums[col['_selectAlias']];
                });

                this.sumRow$.next([sumRow]);
            });
    }
}
