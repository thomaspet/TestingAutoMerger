import {Injectable} from '@angular/core';
import {ITableFilter, IExpressionFilterValue} from './unitable';
import {UniTableColumn, UniTableColumnType, UniTableColumnSortMode} from './config/unitableColumn';
import * as Immutable from 'immutable';
import * as moment from 'moment';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

interface IColumnSetupMap {
    [key: string]: UniTableColumn[];
}

interface ITableFilterMap {
    [key: string]: ISavedFilter[];
}

export interface ISavedFilter {
    name: string;
    filters: ITableFilter[];
}

const CONFIG_STORAGE_KEY: string = 'uniTable_column_configs';
const FILTER_STORAGE_KEY: string = 'uniTable_filters';

@Injectable()
export class UniTableUtils {
    private columnSetupMap: IColumnSetupMap = {};
    private tableFilterMap: ITableFilterMap = {};

    constructor(
        private browserStorage: BrowserStorageService,
    ) {
        try {
            this.columnSetupMap = browserStorage.getItem(CONFIG_STORAGE_KEY) || {};
            this.tableFilterMap = browserStorage.getItem(FILTER_STORAGE_KEY) || {};
        } catch (e) {
            console.log('Error trying to get column setup or filters (unitableUtils constructor)');
            console.log(e);
            this.columnSetupMap = {};
            this.tableFilterMap = {};
        }
    }

    public makeColumnsImmutable(columns: UniTableColumn[]): Immutable.List<any> {
        let immutableColumns = Immutable.List();
        columns.forEach((col) => {
            // REVISIT: do we really need a list of maps?
            // Maybe remove the map? Added benefit of not having to do column.get('..')
            const map = Immutable.Map(col);
            immutableColumns = immutableColumns.push(map);
        });

        return immutableColumns;
    }

    public getColumnSetup(key: string): UniTableColumn[] {
        return this.columnSetupMap[key];
    }

    public saveColumnSetup(key: string, columns: UniTableColumn[]): void {
        if (!key || !columns) {
            return;
        }

        // Since storage can't hold functions/classes we shouldn't save those parts of a column config
        // Because of this we only save the fields we can edit in the column modal
        let safeToSave = [];
        columns.forEach((col: UniTableColumn) => {
            safeToSave.push({
                field: col.field,
                visible: col.visible,
                header: col.header,
                jumpToColumn: col.jumpToColumn,
                _originalField: col['_originalField'],
                sumFunction: col.sumFunction,
                alias: col.alias,
                index: col.index,
            });
        });

        try {
            this.columnSetupMap[key] = safeToSave;
            this.browserStorage.setItem(CONFIG_STORAGE_KEY, this.columnSetupMap);
        } catch (e) {
            console.log(e);
        }
    }

    public removeColumnSetup(key: string): void {
        if (!key) {
            return;
        }

        try {
            delete this.columnSetupMap[key];
            this.browserStorage.setItem(CONFIG_STORAGE_KEY, this.columnSetupMap);
        } catch (e) {
            console.log(e);
        }
    }

    // REVISIT: Everything about saving filters is messy pre-release code with bad naming
    // Sorry :(
    public getFilters(tableName: string): ISavedFilter[] {
        return this.tableFilterMap[tableName] || [];
    }

    public saveFilters(tableName: string, filters: ISavedFilter[]) {
        if (filters && filters.length) {
            // Make sure all filters have names
            // (this is mostly to stop us from saving invalid filter objects)
            this.tableFilterMap[tableName] = filters.filter(filter => !!filter.name);
        } else {
            delete this.tableFilterMap[tableName];
        }

        this.browserStorage.setItem(FILTER_STORAGE_KEY, this.tableFilterMap);
    }

    /**
     * Gets the initial value for an editor based on field value
     * @param {any} filters
     * @param {any} column
     *
     * @returns {string} init value
     */
    public getInitValue(rowModel: Immutable.Map<any, any>, column): string {
        if (!rowModel) {
            return '';
        }
        let columnType = column.get('type');
        let field = column.get('displayField') || column.get('field');
        let initValue;

        if (column.get('template')) {
            initValue = column.get('template')(rowModel.toJS()) || '';
        } else {
            initValue = rowModel.getIn(field.split('.')) || '';
        }

        if (columnType === UniTableColumnType.LocalDate && initValue) {
            initValue = initValue.toDate ? initValue.toDate() : initValue;
        }

        if (columnType === UniTableColumnType.Number
            || columnType === UniTableColumnType.Money
            || columnType === UniTableColumnType.Percent) {

            let format = column.get('numberFormat');
            initValue = initValue.toString().replace('.', format.decimalSeparator);
        }

        return initValue || '';
    }

    /**
     * Creates a filter string for use in url params
     * @param {ITableFilter[]} filters
     *
     * @returns {string} filter url param
     */
    public getFilterString(filters: ITableFilter[], expressionFilterValues: IExpressionFilterValue[], separator?): string {
        if (!filters || !filters.length) {
            return '';
        }

        let filterString: string = '';

        let orderedFilters = filters.sort((a, b) => { return a.group - b.group});

        let lastFilterGroup = 0;
        let isInGroup: boolean = false;

        for (let index = 0; index < orderedFilters.length; index++) {
            let filter: ITableFilter = orderedFilters[index];

            let filterValue: string = this.getFilterValueFromFilter(filter, expressionFilterValues);

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
        }

        // close last group if we are in a group
        if (isInGroup) {
            filterString += ' )';
        }

        return filterString;
    }

    /**
     * Filters an immutable dataset with given filters and returns the result
     * @param {Immutable.List} data
     * @param {ITableFilter[]} filters
     *
     * @returns {Immutable.List} result
     */
    public filterData(data: Immutable.List<any>, filters: ITableFilter[], expressionFilterValues: IExpressionFilterValue[], separator: string = 'and'): Immutable.List<any> {

        // dont use filters that miss either field or operator - this is probably just a filter
        // the user has not finished constructing yet
        if (filters) {
            filters = filters.filter(x => x.field && x.field !== '' && x.operator && x.operator !== '');
        }

        if (!data || !data.count() || !filters || !filters.length) {
            return data;
        }

        var filteredData = data;

        if (separator === 'and') {
            let lastFilterGroup = 0;
            let isInGroup: boolean = false;

            let orderedFilters = filters.sort((a, b) => { return a.group - b.group; });

            let allValidRows = Immutable.List();
            let lastGroupRows = Immutable.List();

            for (let index = 0; index < orderedFilters.length; index++) {
                let filter: ITableFilter = orderedFilters[index];

                let filterValue: string = this.getFilterValueFromFilter(filter, expressionFilterValues);

                // finished with last group - set filtered data to the result of the last group
                if (lastFilterGroup !== filter.group && lastFilterGroup > 0) {
                    filteredData = lastGroupRows;
                    lastGroupRows = Immutable.List();
                    isInGroup = false;
                }

                // new filter group started
                if (!isInGroup && filter.group > 0) {
                    lastFilterGroup = filter.group;
                    isInGroup = true;
                }

                if (isInGroup) {
                    let validRowsForFilter = filteredData.filter(row => this.localDataFilter(filter, filterValue, row));

                    validRowsForFilter.forEach((row) => {
                        lastGroupRows = lastGroupRows.push(row);
                    });
                } else {
                    filteredData = filteredData.filter((row) => {
                        return this.localDataFilter(filter, filterValue, row);
                    }).toList();
                }
            }

            // done processing filters - check if the last filter was in a group, if so set the
            // filtered data to the result of the last groups
            if (isInGroup) {
                filteredData = lastGroupRows;
            }

        } else {
            let allValidRows = Immutable.List();

            filters.forEach((filter) => {
                let validRows = data.filter(row => this.localDataFilter(filter, this.getFilterValueFromFilter(filter, expressionFilterValues), row));
                validRows.forEach((row) => {
                    allValidRows = allValidRows.push(row);
                });
            });

            filteredData = allValidRows.toSet().toList();
        }

        return filteredData;
    }

    private getFilterValueFromFilter(filter: ITableFilter, expressionFilterValues: IExpressionFilterValue[]): string {
        let filterValue = filter.value.toString() || '';

        // If filter is date and operator requires complete date string
        // we need to autocomplete the filter input
        if (filter.isDate && (
            filter.operator === 'eq'
            || filter.operator === 'ne'
            || filter.operator === 'lt'
            || filter.operator === 'le'
            || filter.operator === 'gt'
            || filter.operator === 'ge'
        )) {
            let dateString = '';

            // Split on space, dot, dash or slash
            let dateSplit = filterValue.split(/[ .\-\/]/);

            // Remove non-numeric characters
            dateSplit = dateSplit.map(part => part.replace(/\D/g, ''));

            if (dateSplit[0]) {
                const day = dateSplit[0];
                const month = dateSplit[1] || new Date().getMonth() + 1; // getMonth is 0 indexed
                const year = dateSplit[2] || new Date().getFullYear().toString();

                const momentDate = moment(`${month}-${day}-${year}`);
                if (momentDate.isValid()) {
                    dateString = momentDate.format('YYYY-MM-DD');
                }
            }

            filterValue = dateString;
        }

        // if expressionfiltervalues are defined, e.g. ":currentuserid", check if any of the defined filters
        // should inject the expressionfiltervalue
        if (filterValue.toString().startsWith(':')) {
            const expressionFilterValue = expressionFilterValues.find(efv => ':' + efv.expression === filterValue);

            if (expressionFilterValue) {
                filterValue = expressionFilterValue.value;
            } else {
                console.log('No ExpressionFilterValue defined for filterexpression ' + filterValue);
            }
        }

        return filterValue;
    }

    /**
     * Returns the array sorted by specified field.
     * Subsequent calls with the same field toggles asc/desc/nosort.
     *
     * @param   {string} field
     * @param   {string} direction
     * @param   {number} type
     * @param   {number} mode
     * @param   {Immutable.List} data
     * @returns {Immutable.List} data param sorted by field
     */
    public sort(field: string, direction: number, type: number, mode: number, data: Immutable.List<any>): Immutable.List<any> {
        if (direction === 0) {
            return data;
        }

        return data.sort((a, b) => {
            let fst = a.getIn(field.split('.')) || '';
            let snd = b.getIn(field.split('.')) || '';

            //Different sorting for different types of data
            switch (type) {
                case UniTableColumnType.LocalDate:
                case UniTableColumnType.DateTime:
                    fst = (fst ? moment(fst) : moment()).unix();
                    snd = (snd ? moment(snd) : moment()).unix();
                    break;
                case UniTableColumnType.Money:
                case UniTableColumnType.Number:
                case UniTableColumnType.Percent:
                    if (mode === UniTableColumnSortMode.Absolute) {
                        fst = Math.abs(fst);
                        snd = Math.abs(snd);
                    }
                    break;
                default:
                    fst = fst.toString().toLowerCase();
                    snd = snd.toString().toLowerCase();
                    break;
            }

            if (fst === snd) {
                return 0;
            } else if (fst > snd) {
                return 1 * direction;
            } else if (fst < snd) {
                return -1 * direction;
            }
        }).toList();
    }

    public getFirstFocusableRow(rows: HTMLTableRowElement[], startIndex?: number): HTMLTableRowElement {
        for (let i = startIndex || 0; i < rows.length; i++) {
            if (rows[i].getAttribute('aria-readonly') !== 'true') {
                return rows[i];
            }
        }

        return;
    }

    public getLastFocusableRow(rows: HTMLTableRowElement[], startIndex?: number): HTMLTableRowElement {
        for (let i = startIndex || rows.length - 1; i >= 0; i--) {
            if (rows[i].getAttribute('aria-readonly') !== 'true') {
                return rows[i];
            }
        }

        return;
    }

    public getFirstFocusableCell(row: HTMLTableRowElement, startIndex?: number): HTMLTableCellElement {
        const cells = row.cells || [];
        for (let i = startIndex || 0; i < cells.length; i++) {
            if (cells[i].tabIndex >= 0) {
                return cells[i];
            }
        }

        return;
    }

    public getLastFocusableCell(row: HTMLTableRowElement, tableColumns, config, startIndex?: number): HTMLTableCellElement {
        const cells = row.cells || [];
        for (let i = startIndex || cells.length - 1; i >= 0; i--) {

            const columnConfigIndex: number = config.multiRowSelect ? i - 1 : i;
            const column = tableColumns.get(columnConfigIndex);

            if (cells[i].tabIndex >= 0 && column.get('visible')) {
                return cells[i];
            }
        }

        return;
    }

    // Helpers
    private isNumber(value: any): boolean {
        return !isNaN(value) && isFinite(value);
    }

    private localDataFilter(filter: ITableFilter, filterValue: string, row): boolean {
        const fieldValue = (row.getIn(filter['field'].split('.')) || '').toString().toLowerCase();
        const query = filterValue.toLowerCase();

        if (!query || !query.length) {
            return true;
        }

        if (filter.isDate) {
            return this.checkDateFilter(query, fieldValue, filter.operator);
        }

        switch (filter.operator) {
            case 'contains':
                return fieldValue.indexOf(query) >= 0;
            case 'startswith':
                return fieldValue.indexOf(query) === 0;
            case 'endswith':
                return fieldValue.indexOf(query) === (fieldValue.length - query.length);
            case 'eq':
                return fieldValue === query;
            case 'ne':
                return fieldValue !== query;
            case 'gt':
                if (!this.isNumber(fieldValue) || !this.isNumber(query)) {
                    return false;
                }
                return parseInt(fieldValue, 10) > parseInt(query, 10);
            case 'lt':
                if (!this.isNumber(fieldValue) || !this.isNumber(query)) {
                    return false;
                }
                return parseInt(fieldValue, 10) < parseInt(query, 10);
            case 'ge':
                if (!this.isNumber(fieldValue) || !this.isNumber(query)) {
                    return false;
                }
                return parseInt(fieldValue, 10) >= parseInt(query, 10);
            case 'le':
                if (!this.isNumber(fieldValue) || !this.isNumber(query)) {
                    return false;
                }
                return parseInt(fieldValue, 10) <= parseInt(query, 10);
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

}
