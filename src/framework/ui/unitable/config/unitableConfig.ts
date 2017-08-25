import {UniTableColumn, IUniTableColumn, UniTableColumnType, UniTableColumnSortMode} from './unitableColumn';
import {IContextMenuItem, ITableFilter, IExpressionFilterValue} from '../unitable';

export interface IDeleteButton {
    deleteHandler: (rowModel?: any) => any;
    disableOnReadonlyRows?: boolean;
}

export interface ISortInfo {
    field: string;
    direction: number;
    type: UniTableColumnType;
    mode: UniTableColumnSortMode;
}

export interface IEditorData {
    column: IUniTableColumn;
    rowModel: any;
    initValue: string;
    initAsDirty: boolean;
    cancel: boolean;
}

export interface IUniTableConfig {
    columns: IUniTableColumn[];
    editable?: boolean;
    searchable?: boolean;
    pageable?: boolean;
    pageSize?: number;
    multiRowSelect?: boolean;
    columnMenuVisible?: boolean;
    changeCallback?: (event: IRowChangeEvent) => any | Promise<any>;
    dataMapper?: (data) => Array<any>;
    autoAddNewRow?: boolean;
    allowGroupFilter?: boolean;
    allowConfigChanges?: boolean;
    sortable?: boolean;
    defaultRowData?: Object;
    conditionalRowCls?: (rowModel: any) => string;
    contextMenu?: {
        items: IContextMenuItem[],
        showDropdownOnSingleItem: boolean,
        disableOnReadonlyRows: boolean
    };
    deleteButton: boolean | IDeleteButton;
    filters?: ITableFilter[];
    expressionFilterValues?: IExpressionFilterValue[];
    isRowReadOnly?: (rowModel) => boolean;
    defaultOrderBy?: ISortInfo;
    autoScrollIfNewCellCloseToBottom?: boolean;

    beforeEdit?: (editorData: IEditorData) => IEditorData;
}

export interface IRowChangeEvent {
    field: string;
    rowModel: any;
    originalIndex: number;
    newValue: any;
    triggeredByOtherEvent?: boolean;
    copyEvent?: boolean;
}

export class UniTableConfig implements IUniTableConfig {
    public columns: IUniTableColumn[];
    public editable: boolean;
    public searchable: boolean;
    public pageable: boolean;
    public pageSize: number;
    public autoAddNewRow: boolean;
    public allowGroupFilter: boolean;
    public allowConfigChanges: boolean;
    public sortable: boolean;
    public multiRowSelect: boolean;
    public columnMenuVisible: boolean;
    public autoScrollIfNewCellCloseToBottom: boolean;
    public deleteButton: boolean | IDeleteButton;
    public conditionalRowCls: (rowModel: any) => string;
    public contextMenu: {
        items: IContextMenuItem[],
        showDropdownOnSingleItem: boolean,
        disableOnReadonlyRows: boolean
    };

    public filters: ITableFilter[];
    public expressionFilterValues: IExpressionFilterValue[];
    public changeCallback: (event: IRowChangeEvent) => any;
    public dataMapper: (data) => Array<any>;
    public defaultRowData: Object;
    public isRowReadOnly: (rowModel) => boolean;
    public defaultOrderBy: ISortInfo;

    public beforeEdit: (event: IEditorData) => IEditorData;

    constructor(editable?: boolean, pageable?: boolean, pageSize?: number) {
        this.editable = (editable !== undefined) ? editable : true;
        this.pageable = (pageable !== undefined) ? pageable : true;
        this.columnMenuVisible = false;
        this.pageSize = pageSize || 25;
        this.autoAddNewRow = true;
        this.allowGroupFilter = false;
        this.allowConfigChanges = false;
        this.sortable = true;
        this.multiRowSelect = false;
        this.deleteButton = false;
        this.autoScrollIfNewCellCloseToBottom = false;
        this.contextMenu = {items: [], disableOnReadonlyRows: false, showDropdownOnSingleItem: true};
        this.columns = [];
        this.expressionFilterValues = [];
        this.isRowReadOnly = (rowModel) => {
            return false;
        };
        this.conditionalRowCls = () => {
            return '';
        };
    }

    public setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }

    public setColumnMenuVisible(columnMenuVisible: boolean) {
        this.columnMenuVisible = columnMenuVisible;
        return this;
    }

    public setSearchable(searchable: boolean) {
        this.searchable = searchable;
        return this;
    }

    public setSortable(sortable: boolean) {
        this.sortable = sortable;
        return this;
    }

    public setPageable(pageable: boolean) {
        this.pageable = pageable;
        return this;
    }

    public setPageSize(pageSize: number) {
        this.pageSize = pageSize;
        return this;
    }

    public setAutoAddNewRow(autoAddNewRow: boolean) {
        this.autoAddNewRow = autoAddNewRow;
        return this;
    }

    public setAllowGroupFilter(allowGroupFilter: boolean) {
        this.allowGroupFilter = allowGroupFilter;
        return this;
    }

    public setDefaultRowData(defaultRowData: Object) {
        this.defaultRowData = defaultRowData;
        return this;
    }

    public setChangeCallback(changeCallback: (event) => any) {
        this.changeCallback = changeCallback;
        return this;
    }

    public setDataMapper(dataMapper: (data) => Array<any>) {
        this.dataMapper = dataMapper;
        return this;
    }

    public setAllowConfigChanges(allowConfigChanges: boolean) {
        this.allowConfigChanges = allowConfigChanges;
        return this;
    }

    public setMultiRowSelect(multirowSelect: boolean) {
        this.multiRowSelect = multirowSelect;
        return this;
    }

    public setAutoScrollIfNewCellCloseToBottom(autoscroll: boolean) {
        this.autoScrollIfNewCellCloseToBottom = autoscroll;
        return this;
    }

    public setColumns(columns: IUniTableColumn[]) {
        this.columns = columns;
        return this;
    }

    public setContextMenu(items: IContextMenuItem[], showDropdownOnSingleItem: boolean = true, disableOnReadonlyRows: boolean = false) {
        this.contextMenu = {
            items: items,
            disableOnReadonlyRows: disableOnReadonlyRows,
            showDropdownOnSingleItem: showDropdownOnSingleItem
        };

        return this;
    }

    public setDeleteButton(deleteButton: boolean | IDeleteButton) {
        this.deleteButton = deleteButton;
        return this;
    }

    public setExpressionFilterValues(expressionFilterValues: Array<IExpressionFilterValue>) {
        this.expressionFilterValues = expressionFilterValues;
        return this;
    }

    public setFilters(filters: ITableFilter[]) {
        this.filters = filters;
        return this;
    }

    public setIsRowReadOnly(isRowReadOnly: (rowModel) => boolean) {
        this.isRowReadOnly = isRowReadOnly;
        return this;
    }

    public setDefaultOrderBy(field: string, direction: number) {
        this.defaultOrderBy = {
            field: field,
            direction: direction,
            type: UniTableColumnType.Text
        };
        return this;
    }

    public setBeforeEdit(beforeEdit: (editorData: IEditorData) => IEditorData) {
        this.beforeEdit = beforeEdit;
        return this;
    }

    public setConditionalRowCls(conditionalRowCls: (rowModel: any) => string) {
        this.conditionalRowCls = conditionalRowCls;
        return this;
    }

    public static fromObject(obj: IUniTableConfig) {
        let config = new UniTableConfig();

        Object.keys(obj).forEach((key) => {
            if (key  === 'columns') {
                let columns = [];
                obj[key].forEach((col) => {
                    columns.push(UniTableColumn.fromObject(col));
                });

                config[key] = columns;
            } else {
                config[key] = obj[key];
            }
        });

        return config;
    }

}
