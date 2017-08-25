import {Injectable} from '@angular/core';
import {ITableFilter, IExpressionFilterValue} from './unitable';
import {UniTableColumnType, UniTableColumnSortMode} from './config/unitableColumn';
import * as Immutable from 'immutable';
import * as moment from 'moment';

@Injectable()
export class UniTableUtils {

    /**
     * Gets the initial value for an editor based on field value
     * @param {any} filters
     * @param {any} column
     *
     * @returns {string} init value
     */
    public getInitValue(rowModel, column): string {
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

        if (columnType === UniTableColumnType.DateTime) {
            const parsedDate = moment(initValue);
            initValue = parsedDate.isValid() ? parsedDate.format('DD.MM.YYYY') : '';
        }

        if (columnType === UniTableColumnType.LocalDate && initValue) {
            const date = initValue.toDate ? initValue.toDate() : initValue;
            const parsedDate = moment(date);
            initValue = parsedDate.isValid() ? parsedDate.format('DD.MM.YYYY') : '';
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

        // dont use filters that miss either field or operator - this is probably just a filter
        // the user has not finished constructing yet
        if (filters) {
            filters = filters.filter(x => x.field && x.field !== '' && x.operator && x.operator !== '');
        }

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
                    filterString += ')';
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
            filterString += ')';
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
        let filterValue = filter.value.toString();

        // if expressionfiltervalues are defined, e.g. ":currentuserid", check if any of the defined filters
        // should inject the expressionfiltervalue
        if (filterValue.toString().startsWith(':')) {
            let expressionFilterValue = expressionFilterValues.find(efv => ':' + efv.expression === filterValue);

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
        let fieldValue = (row.getIn(filter['field'].split('.')) || '').toString().toLowerCase();
        filterValue = filterValue.toLowerCase();

        switch (filter.operator) {
            case 'contains':
                return fieldValue.indexOf(filterValue) >= 0;
            case 'startswith':
                return fieldValue.indexOf(filterValue) === 0;
            case 'endswith':
                return fieldValue.indexOf(filterValue) === (fieldValue.length - filterValue.length);
            case 'eq':
                return fieldValue === filterValue;
            case 'ne':
                return fieldValue !== filterValue;
            case 'gt':
                if (!this.isNumber(fieldValue) || !this.isNumber(filterValue)) {
                    return false;
                }
                return parseInt(fieldValue) > parseInt(filterValue);
            case 'lt':
                if (!this.isNumber(fieldValue) || !this.isNumber(filterValue)) {
                    return false;
                }
                return parseInt(fieldValue) < parseInt(filterValue);
            case 'ge':
                if (!this.isNumber(fieldValue) || !this.isNumber(filterValue)) {
                    return false;
                }
                return parseInt(fieldValue) >= parseInt(filterValue);
            case 'le':
                if (!this.isNumber(fieldValue) || !this.isNumber(filterValue)) {
                    return false;
                }
                return parseInt(fieldValue) <= parseInt(filterValue);
            }
    }

}
