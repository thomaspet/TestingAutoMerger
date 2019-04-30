import {Injectable} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableColumnSortMode} from '@uni-framework/ui/unitable/config/unitableColumn';
import {UniTableConfig} from '@uni-framework/ui/unitable/config/unitableConfig';
import {ISavedSearch, ITableFilter} from '../interfaces';

import * as _ from 'lodash';
import * as moment from 'moment';

interface SortModel { colId: string; sort: string; }

interface ColumnSetupMap { [key: string]: UniTableColumn[]; }
interface SavedSearchMap { [key: string]: ISavedSearch[]; }
interface SortMap { [key: string]: SortModel; }

const CONFIG_STORAGE_KEY = 'uniTable_column_configs';
const FILTER_STORAGE_KEY = 'uniTable_filters';
const SORT_STORAGE_KEY = 'uniTable_sort';

@Injectable()
export class TableUtils {
    private columnSetupMap: ColumnSetupMap = {};
    private savedSearchMap: SavedSearchMap = {};
    private sortMap: SortMap = {};

    constructor() {
        const getSavedSettings = (key: string) => {
            try {
                return JSON.parse(localStorage.getItem(key)) || {};
            } catch (e) {
                console.error(`Error getting ${key} in ag-grid table utils`, e);
                return {};
            }
        };

        this.columnSetupMap = getSavedSettings(CONFIG_STORAGE_KEY);
        this.savedSearchMap = getSavedSettings(FILTER_STORAGE_KEY);
        this.sortMap = getSavedSettings(SORT_STORAGE_KEY);
    }

    // Local sorting functions
    dateComparator(rowNode1, rowNode2, column: UniTableColumn) {
        const field = column.alias || column.field;
        const value1 = _.get(rowNode1.data, field, '');
        const value2 = _.get(rowNode2.data, field, '');

        const unix1 = moment(value1).isValid() ? moment(value1).unix() : 0;
        const unix2 = moment(value2).isValid() ? moment(value2).unix() : 0;
        return unix1 - unix2;
    }

    numberComparator(rowNode1, rowNode2, column: UniTableColumn) {
        const mode = column.sortMode;
        const field = column.alias || column.field;
        const value1 = _.get(rowNode1.data, field, 0);
        const value2 = _.get(rowNode2.data, field, 0);
        if (mode === UniTableColumnSortMode.Absolute) {
            return Math.abs(value1) - Math.abs(value2);
        } else {
            return value1 - value2;
        }
    }

    public getColumnSetupMap(configKey: string): UniTableColumn[] {
        return this.columnSetupMap && this.columnSetupMap[configKey];
    }

    public getTableColumns(tableConfig: UniTableConfig): UniTableColumn[] {
        const configColumns = _.cloneDeep(tableConfig.columns);
        const key = tableConfig.configStoreKey;

        const customColumnSetup = this.columnSetupMap[key];
        if (!customColumnSetup || !customColumnSetup.length) {
            return this.fixColumnWidths(configColumns);
        }

        const columns = configColumns.map(configColumn => {
            const savedColumn = customColumnSetup.find(col => col.field === configColumn.field);
            if (savedColumn) {
                return Object.assign({}, configColumn, savedColumn);
            } else {
                return configColumn;
            }
        });

        const sorted = columns.sort((col1, col2) => {
            const col1Index = col1.index >= 0 ? col1.index : 99;
            const col2Index = col2.index >= 0 ? col2.index : 99;
            return col1Index - col2Index;
        });

        return this.fixColumnWidths(_.cloneDeep(sorted));
    }

    private fixColumnWidths(columns: UniTableColumn[]): UniTableColumn[] {
        // ngx-datatable requires numeric (px) column widths
        return columns.map(col => {
            if (col.width && typeof col.width !== 'number') {
                const washed = parseInt(col.width.replace(/[^0-9\.]/g, ''), 10);

                if (!washed) {
                    return col;
                }

                if (col.width.includes('%')) {
                    col.width = undefined; // cant calculate px value from percent
                } else if (col.width.includes('px')) {
                    col.width = washed;
                } else if (col.width.includes('rem')) {
                    col.width = washed * 16; // 16 = root em (as of 08.01.2018, typography.sass)
                } else if (!/[^0-9\.]/g.test(col.width)) {
                    col.width = +col.width;
                }
            }

            if (!col.width) {
                col.width = 150;
            }

            return col;
        });
    }

    public saveColumnSetup(key: string, columns: UniTableColumn[]): void {
        if (!key || !columns) {
            return;
        }

        // Since storage can't hold functions/classes we shouldn't save those parts of a column config
        // Because of this we only save the fields we can edit in the column modal
        const safeToSave = [];
        columns.forEach((col: UniTableColumn) => {
            safeToSave.push({
                field: col.field,
                visible: col.visible,
                jumpToColumn: col.jumpToColumn,
                _originalField: col['_originalField'],
                sumFunction: col.sumFunction,
                alias: col.alias,
                width: col.width,
                index: col.index
            });
        });

        try {
            this.columnSetupMap[key] = safeToSave;
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.columnSetupMap));
        } catch (e) {
            console.error(e);
        }
    }

    public removeColumnSetup(key: string): void {
        if (!key) {
            return;
        }

        try {
            delete this.columnSetupMap[key];
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.columnSetupMap));
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Gets display value for column
     * @param {any} rowModel
     * @param {any} column
     *
     * @returns {string} displayValue
     */
    public getColumnValue(rowModel: any, column: UniTableColumn): string {
        if (!rowModel) {
            return '';
        }

        if (rowModel._isSumRow && !column.isSumColumn) {
            return '';
        }

        const columnType = column.type;
        const field = column.displayField || column.alias || column.field;
        let value;

        if (column.template) {
            value = column.template(rowModel) || (rowModel._isSumRow ? 0 : '');
        } else {
            value = _.get(rowModel, field) || (rowModel._isSumRow ? 0 : '');
        }
        switch (column.type) {
            case UniTableColumnType.DateTime:
            case UniTableColumnType.LocalDate:
                if (value) {
                    const date = value.toDate ? value.toDate() : value;
                    value = moment(date).format(column.format || 'DD.MM.YYYY');
                    if (value === 'Invalid date') {
                        value = '';
                    }
                }
            break;

            case UniTableColumnType.Boolean:
                value = value ? 'Ja' : 'Nei';
            break;

            case UniTableColumnType.Number:
            case UniTableColumnType.Money:
            case UniTableColumnType.Percent:
                if (value || (value === 0 && rowModel._isSumRow)) {
                    const format = column.numberFormat || {};
                    if (format.decimalLength >= 0) {
                        value = parseFloat(value).toFixed(format.decimalLength);
                    }

                    let [integer, decimal] = value.toString().split('.');
                    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandSeparator);

                    if (decimal && decimal.length) {
                        value = `${integer}${format.decimalSeparator}${decimal}`;
                    } else {
                        value = integer;
                    }

                    value = `${format.prefix || ''}${value}${format.postfix || ''}`;
                }
            break;
        }

        return value || '';
    }

    getLastUsedFilter(tableName: string): ITableFilter[] {
        const key = tableName + '_filters';
        try {
            const filters = JSON.parse(sessionStorage.getItem(key));
            if (filters && filters.length) {
                return filters;
            }
        } catch (e) { console.error(e); }
    }

    setLastUsedFilter(tableName: string, filters: ITableFilter[]) {
        const key = tableName + '_filters';

        if (filters && filters.length) {
            sessionStorage.setItem(key, JSON.stringify(filters || []));
        } else {
            sessionStorage.removeItem(key);
        }
    }

    getSavedSearches(tableName: string): ISavedSearch[] {
        return this.savedSearchMap[tableName] || [];
    }

    saveSearch(tableName: string, search: ISavedSearch): void {
        const savedSearches = this.savedSearchMap[tableName] || [];
        const existingSearchIndex = savedSearches.findIndex(s => s.name === search.name);

        if (existingSearchIndex >= 0) {
            savedSearches[existingSearchIndex] = search;
        } else {
            savedSearches.push(search);
        }

        this.savedSearchMap[tableName] = savedSearches;
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(this.savedSearchMap));
    }

    removeSearch(tableName: string, search: ISavedSearch): ISavedSearch[] {
        const savedSearches = this.savedSearchMap[tableName] || [];
        const index = savedSearches.findIndex(s => s.name === search.name);
        if (index >= 0) {
            savedSearches.splice(index, 1);
            this.savedSearchMap[tableName] = savedSearches;
            localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(this.savedSearchMap));
        }

        return savedSearches;
    }

    getSortModel(tableName: string): SortModel {
        return this.sortMap[tableName];
    }

    saveSortModel(tableName: string, sortModel: SortModel): void {
        this.sortMap[tableName] = sortModel;
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(this.sortMap));
    }

    removeSortModel(tableName: string): void {
        delete this.sortMap[tableName];
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(this.sortMap));
    }
}
