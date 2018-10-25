import {Injectable} from '@angular/core';
import {UniTableColumn, UniTableColumnType} from '@uni-framework/ui/unitable/config/unitableColumn';
import {UniTableConfig} from '@uni-framework/ui/unitable/config/unitableConfig';
import {ISavedFilter} from '../interfaces';

import * as _ from 'lodash';
import * as moment from 'moment';

interface IColumnSetupMap {
    [key: string]: UniTableColumn[];
}

interface ITableFilterMap {
    [key: string]: ISavedFilter[];
}

const CONFIG_STORAGE_KEY: string = 'uniTable_column_configs';
const FILTER_STORAGE_KEY: string = 'uniTable_filters';

@Injectable()
export class TableUtils {
    private columnSetupMap: IColumnSetupMap = {};
    private tableFilterMap: ITableFilterMap = {};

    constructor() {
        try {
            this.columnSetupMap = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)) || {};
            this.tableFilterMap = JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY)) || {};
        } catch (e) {
            console.error('Error trying to get column setup or filters (unitableUtils constructor)');
            console.error(e);
            this.columnSetupMap = {};
            this.tableFilterMap = {};
        }
    }

    public getColumnSetupMap(configKey: string): UniTableColumn[] {
        return this.columnSetupMap && this.columnSetupMap[configKey];
    }

    public getTableColumns(tableConfig: UniTableConfig): UniTableColumn[] {
        const defaultColumns = _.cloneDeep(tableConfig.columns);
        const key = tableConfig.configStoreKey;

        const customColumnSetup = this.columnSetupMap[key];
        if (!customColumnSetup || !customColumnSetup.length) {
            return this.fixColumnWidths(defaultColumns);
        }

        // First check if config contains columns that does not exist
        // custom setup. This means that default config has changed
        // and we need to invalidate the user's config
        let resetColumnConfig = !defaultColumns.every(col => {
            return customColumnSetup.some(customCol => customCol.field === col.field);
        });

        let columns = [];
        if (!resetColumnConfig) {
            // Extend the default column config with the custom one.
            // Extending because localStorage can't hold functions/components etc
            // So only a set of pre-defined fields are saved
            for (const customColumn of customColumnSetup) {
                const originalCol = defaultColumns.find(c => c.field === customColumn.field);
                if (originalCol) {
                    columns.push(Object.assign({}, originalCol, customColumn));
                } else {
                    // If we can't find an original column with the same field
                    // it means either the default config changed or a table with the
                    // same name and different config exists somewhere in the app.
                    // At this point we need to reset in order to avoid crashing
                    resetColumnConfig = true;
                    break;
                }
            }
        }

        if (resetColumnConfig) {
            this.removeColumnSetup(key);
            columns = tableConfig.columns;
        }

        const clone = _.cloneDeep(columns);
        return this.fixColumnWidths(clone);
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
                width: col.width
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

    public getFilters(tableName: string): ISavedFilter[] {
        return this.tableFilterMap[tableName] || [];
    }

    public saveFilters(tableName: string, filters: ISavedFilter[]): void {
        if (filters && filters.length) {
            // Make sure all filters have names
            // (this is mostly to stop us from saving invalid filter objects)
            this.tableFilterMap[tableName] = filters.filter(filter => !!filter.name);
        } else {
            delete this.tableFilterMap[tableName];
        }

        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(this.tableFilterMap));
    }
}
