import {Injectable} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {UniTableColumn, UniTableColumnType, UniTableColumnSortMode} from '../../unitable/config/unitableColumn';
import {UniTableConfig} from '../../unitable/config/unitableConfig';
import {GridApi, IDatasource, IGetRowsParams} from 'ag-grid';
import {ITableFilter, IExpressionFilterValue} from '../interfaces';
import {TableUtils} from './table-utils';
import {StatisticsService} from '@app/services/common/statisticsService';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class TableDataService {
    private config: UniTableConfig;
    private gridApi: GridApi;
    private hasRemoteLookup: boolean;

    public sumRow$: BehaviorSubject<any[]> = new BehaviorSubject(undefined);
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

    constructor(private statisticsService: StatisticsService) {}

    public initialize(gridApi: GridApi, config: UniTableConfig, resource) {
        this.gridApi = gridApi;
        this.config = config;

        this.filterString = undefined;
        this.setFilters(config.filters, [], false);

        if (Array.isArray(resource)) {
            this.originalData = this.setMetadata(resource);
            const filteredData = this.filterLocalData(this.originalData);
            this.loadedRowCount = filteredData.length;

            this.gridApi.setRowData(filteredData);
            const lastRow = filteredData.length && filteredData[filteredData.length - 1];
            if (this.config.editable && (!lastRow || !lastRow['_isEmpty'])) {
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
            const sumColumns = this.config.columns.filter(col => col.isSumColumn);
            if (sumColumns.length) {
                this.getLocalDataColumnSums(sumColumns, resource);
            }
        }
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
                            totalRowCount = res.headers && res.headers.get('count');
                            data = res.json();
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
                            .subscribe(sums => {
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
            if (this.hasRemoteLookup) {
                this.gridApi.refreshInfiniteCache();
            } else {
                this.viewData = this.filterLocalData(this.originalData);
                this.gridApi.setRowData(this.viewData);
                this.localDataChange$.next(this.originalData);

                // Re-calculate sum row if we have sum columns
                setTimeout(() => {
                    const sumColumns = this.config.columns.filter(col => col.isSumColumn);
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
        } else {
            this.originalData.splice(originalIndex, 1);
            this.originalData.forEach((r, index) => r['_originalIndex'] = index);
        }

        if (this.originalData.length) {
            this.refreshData();
        } else {
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

        newRow = _.cloneDeep(newRow); // avoid multiple new rows having the same reference
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

        let data = _.cloneDeep(originalData).filter(row => !row.Deleted);

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
        const value = (_.get(item, filter.field) || '').toString().toLowerCase();

        if (!query || !query.length) {
            return true;
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

    public sortLocalData(data: any[], column: UniTableColumn, direction: 'asc'|'desc'): any[] {
        const directionNumeric = direction === 'asc' ? 1 : -1;
        const type = column.type;
        const mode = column.sortMode;
        const field = column.alias || column.field;

        const sorted = data.sort((a, b) => {
            // REVISIT: Might want to run template functions here?
            // How big of a performance hit would that be on large datasets?
            let first = _.get(a, field) || '';
            let second = _.get(b, field) || '';

            // Different sorting for different data types
            switch (type) {
                case UniTableColumnType.LocalDate:
                case UniTableColumnType.DateTime:
                    first = (first ? moment(first) : moment()).unix();
                    second = (second ? moment(second) : moment()).unix();
                    break;
                case UniTableColumnType.Money:
                case UniTableColumnType.Number:
                case UniTableColumnType.Percent:
                    if (mode === UniTableColumnSortMode.Absolute) {
                        first = Math.abs(first);
                        second = Math.abs(second);
                    }
                    break;
                default:
                    first = first.toString().toLowerCase();
                    second = second.toString().toLowerCase();
                    break;
            }

            if (first === second) {
                return 0;
            } else if (first > second) {
                return 1 * directionNumeric;
            } else if (first < second) {
                return -1 * directionNumeric;
            }

            return 1;
        });

        return sorted;
    }

    public setFilters(
        advancedSearchFilters: ITableFilter[] = [],
        basicSearchFilters: ITableFilter[] = [],
        refreshTableData: boolean = true
    ): void {
        // Dont use filters that are missing field or operator.
        // This generally means the user is not done creating them yet
        advancedSearchFilters = advancedSearchFilters.filter(f => !!f.field && !!f.operator);
        basicSearchFilters = basicSearchFilters.filter(f => !!f.field && !!f.operator);

        // Sort advanced filters by group
        advancedSearchFilters = advancedSearchFilters.sort((a, b) => a.group - b.group);

        this.advancedSearchFilters = advancedSearchFilters;
        this.basicSearchFilters = basicSearchFilters;

        const filterStrings: string[] = [];
        if (this.basicSearchFilters && this.basicSearchFilters.length) {
            filterStrings.push(this.getFilterString(this.basicSearchFilters, this.config.expressionFilterValues, 'or'));
        }

        if (this.advancedSearchFilters && this.advancedSearchFilters.length) {
            filterStrings.push(this.getFilterString(this.advancedSearchFilters, this.config.expressionFilterValues));
        }

        this.filterString = filterStrings.join(' and ');

        if (refreshTableData) {
            this.refreshData();
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
                if (lastFilterGroup.toString() !== filter.group.toString() && lastFilterGroup > 0) {
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
                    lastFilterGroup = filter.group;
                    isInGroup = true;
                }

                if (filter.operator === 'contains' || filter.operator === 'startswith' || filter.operator === 'endswith') {
                    // Function operator
                    filterString += (`${filter.operator}(${filter.field},'${filterValue}')`);
                } else {
                    // Logical operator
                    filterString += `${filter.field} ${filter.operator} '${filterValue}'`;
                }
            }
        });

        // close last group if we are in a group
        if (isInGroup) {
            filterString += ' )';
        }

        return filterString;
    }

    private getFilterValueFromFilter(filter: ITableFilter, expressionFilterValues: IExpressionFilterValue[]): string {
        let filterValue = filter.searchValue
            ? filter.searchValue || ''
            : filter.value || '';

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
            sumRow[col.alias || col.field] = data.reduce((sum, row) => {
                return sum += parseInt(_.get(row, col.alias || col.field, 0), 10);
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
