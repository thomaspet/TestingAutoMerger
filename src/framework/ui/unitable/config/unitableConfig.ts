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
    configStoreKey?: string;
    entityType?: string;
    columns: UniTableColumn[];
    editable?: boolean;
    searchable?: boolean;
    pageable?: boolean;
    pageSize?: number;
    multiRowSelect?: boolean;
    multiRowSelectDefaultValue?: boolean;
    selectOnlyVisible?: boolean;
    columnMenuVisible?: boolean;
    advancedColumnMenu?: boolean;
    changeCallback?: (event: IRowChangeEvent) => any | Promise<any>;
    dataMapper?: (data) => Array<any>;
    autoAddNewRow?: boolean;
    allowGroupFilter?: boolean;
    sortable?: boolean;
    defaultRowData?: Object;
    conditionalRowCls?: (rowModel: any) => string;
    contextMenu?: {
        items: IContextMenuItem[],
        showDropdownOnSingleItem: boolean,
        disableOnReadonlyRows: boolean
    };
    deleteButton: boolean | IDeleteButton;
    disableDeleteOnReadonly?: boolean;
    filters?: ITableFilter[];
    expressionFilterValues?: IExpressionFilterValue[];
    isRowReadOnly?: (rowModel) => boolean;
    isRowSelectable?: (rowModel) => boolean;
    defaultOrderBy?: ISortInfo;
    autoScrollIfNewCellCloseToBottom?: boolean;
    beforeEdit?: (editorData: IEditorData) => IEditorData;
    insertRowHandler?: (index: number) => void;
    searchListVisible?: boolean;
    headerVisible?: boolean;
    rowDraggable?: boolean;
    autofocus?: boolean;
    showTotalRowCount?: boolean;
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
    public configStoreKey: string;
    public entityType: string;
    public columns: UniTableColumn[];
    public editable: boolean;
    public searchable: boolean;
    public pageable: boolean;
    public pageSize: number;
    public autoAddNewRow: boolean;
    public allowGroupFilter: boolean;
    public sortable: boolean;
    public rowDraggable: boolean;
    public multiRowSelect: boolean;
    public multiRowSelectDefaultValue: boolean;
    public selectOnlyVisible: boolean;
    public columnMenuVisible: boolean;
    public advancedColumnMenu: boolean;
    public autoScrollIfNewCellCloseToBottom: boolean;
    public deleteButton: boolean | IDeleteButton;
    public disableDeleteOnReadonly: boolean;
    public searchListVisible: boolean;
    public conditionalRowCls: (rowModel: any) => string;
    public contextMenu: {
        items: IContextMenuItem[],
        showDropdownOnSingleItem: boolean,
        disableOnReadonlyRows: boolean
    };
    public copyFromCellAbove: boolean;
    public insertRowHandler?: (index: number) => void;

    public filters: ITableFilter[];
    public expressionFilterValues: IExpressionFilterValue[];
    public changeCallback: (event: IRowChangeEvent) => any;
    public dataMapper: (data) => Array<any>;
    public defaultRowData: Object;
    public isRowReadOnly: (rowModel) => boolean;
    public isRowSelectable: (rowModel) => boolean;
    public defaultOrderBy: ISortInfo;

    public beforeEdit: (event: IEditorData) => IEditorData;
    public headerVisible: boolean;
    public autofocus: boolean;
    public showTotalRowCount: boolean;
    public rowGroupPanelShow?: string;
    public suppressMakeColumnVisibleAfterUnGroup: boolean;
    public suppressDragLeaveHidesColumns: boolean;
    public autoGroupColumnDef: any;
    public groupsDefaultExpanded: boolean;
    public isGroupingTicker: boolean;

    /**
     * @constructor
     * @param tableName Unique name for the table. This is used as key when saving column setup.
     * @param editable
     * @param pageable
     * @param pageSize
     */
    constructor(configStoreKey: string, editable?: boolean, pageable?: boolean, pageSize?: number) {
        this.configStoreKey = configStoreKey;
        this.editable = (editable !== undefined) ? editable : true;
        this.pageable = (pageable !== undefined) ? pageable : true;
        this.columnMenuVisible = true;
        this.pageSize = pageSize || 20;
        this.autoAddNewRow = true;
        this.allowGroupFilter = false;
        this.sortable = true;
        this.multiRowSelect = false;
        this.multiRowSelectDefaultValue = false;
        this.deleteButton = false;
        this.autoScrollIfNewCellCloseToBottom = false;
        this.contextMenu = {items: [], disableOnReadonlyRows: false, showDropdownOnSingleItem: true};
        this.columns = [];
        this.expressionFilterValues = [];

        this.copyFromCellAbove = true;
        this.headerVisible = true;
    }

    public static fromObject(obj: IUniTableConfig, configStoreKey: string) {
        const config = new UniTableConfig(configStoreKey);

        Object.keys(obj).forEach((key) => {
            if (key  === 'columns') {
                const columns = [];
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

    public setAutofocus(autofocus: boolean) {
        this.autofocus = autofocus;
        return this;
    }

    public setHeaderVisible(visible: boolean) {
        this.headerVisible = visible;
        return this;
    }

    public setEntityType(entityType: string) {
        this.entityType = entityType;
        return this;
    }

    public setEditable(editable: boolean) {
        this.editable = editable;
        return this;
    }

    public setColumnMenuVisible(columnMenuVisible: boolean, advancedColumnMenu: boolean = false) {
        this.columnMenuVisible = columnMenuVisible;
        this.advancedColumnMenu = advancedColumnMenu;
        return this;
    }

    public setRowGroupPanelShow(rowGroupPanelShow: string) {
        this.rowGroupPanelShow = rowGroupPanelShow;
        return this;
    }

    public setGroupsDefaultExpanded(defaultExpanded: boolean) {
        this.groupsDefaultExpanded = defaultExpanded;
        return this;
    }

    public setSuppressMakeColumnVisibleAfterUnGroup(suppressMakeColumnVisibleAfterUnGroup: boolean) {
        this.suppressMakeColumnVisibleAfterUnGroup = suppressMakeColumnVisibleAfterUnGroup;
        return this;
    }

    public setSuppressDragLeaveHidesColumns(suppressDragLeaveHidesColumns: boolean) {
        this.suppressDragLeaveHidesColumns = suppressDragLeaveHidesColumns;
        return this;
    }

    public setAutoGroupColumnDef(autoGroupColumnDef: any) {
        this.autoGroupColumnDef = autoGroupColumnDef;
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

    public setRowDraggable(draggable: boolean) {
        this.rowDraggable = draggable;
        return this;
    }

    public setPageable(pageable: boolean) {
        this.pageable = pageable;
        return this;
    }

    public setPageSize(pageSize: number) {
        this.pageSize = pageSize || 20;
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

    public setMultiRowSelect(
        multirowSelect: boolean,
        multiRowSelectDefaultValue?: boolean,
        selectOnlyVisible?: boolean
    ) {
        this.multiRowSelect = multirowSelect;
        this.multiRowSelectDefaultValue = multiRowSelectDefaultValue || false;
        this.selectOnlyVisible = selectOnlyVisible || false;
        return this;
    }

    public setAutoScrollIfNewCellCloseToBottom(autoscroll: boolean) {
        this.autoScrollIfNewCellCloseToBottom = autoscroll;
        return this;
    }

    public setConfigStoreKey(key: string): UniTableConfig {
        this.configStoreKey = key;
        return this;
    }

    public setColumns(columns: UniTableColumn[]) {
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

    public setDeleteButton(deleteButton: boolean | IDeleteButton, disableOnReadonly?: boolean) {
        this.deleteButton = deleteButton;
        this.disableDeleteOnReadonly = disableOnReadonly;
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

    public setIsRowSelectable(isRowSelectable: (rowModel) => boolean) {
        this.isRowSelectable = isRowSelectable;
        return this;
    }

    public setDefaultOrderBy(field: string, direction: number, mode: number = UniTableColumnSortMode.Normal) {
        this.defaultOrderBy = {
            field: field,
            direction: direction,
            type: UniTableColumnType.Text,
            mode: mode
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

    public setCopyFromCellAbove(copyFromCellAbove: boolean) {
        this.copyFromCellAbove = copyFromCellAbove;
        return this;
    }

    public setInsertRowHandler(handler: (index: number) => void) {
        this.insertRowHandler = handler;
        return this;
    }

    public setSearchListVisible(visible: boolean) {
        this.searchListVisible = visible;
        return this;
    }

    public setShowTotalRowCount(show: boolean) {
        this.showTotalRowCount = show;
        return this;
    }
}
