import {UniTableColumn} from '../unitable/config/unitableColumn';

export interface ITableFilter {
    field: string;
    operator: string;
    value: string | number;
    group?: number;
    selectConfig?: {options: Array<any>, valueField: string, displayField: string};
    isDate?: boolean;
}

export interface IOptionBanner {
    visible?: boolean;
    text?: string;
    link?: string;
    action: () => void;
}

export interface ISavedSearch {
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
