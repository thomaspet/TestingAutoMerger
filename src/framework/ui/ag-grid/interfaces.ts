import {UniTableColumn} from '../unitable/config/unitableColumn';

export interface ITableFilter {
    field: string;
    operator: string;
    value: string | number;
    group: number;
    searchValue: string;
    selectConfig: {options: Array<any>, valueField: string, displayField: string};
}

export interface ISavedFilter {
    name: string;
    filters: ITableFilter[];
}

export interface IExpressionFilterValue {
    expression: string;
    value: string;
}

export interface ICellClickEvent {
    row: any;
    column: UniTableColumn;
}

export interface IRowChangeEvent {
    rowModel: any;
    field: string;
    newValue: any;
    originalIndex: number;
}
