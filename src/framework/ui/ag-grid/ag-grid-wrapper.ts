import {
    Component,
    Input,
    Output,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    EventEmitter,
    ViewChild,
    ElementRef,
} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {UniTableConfig} from '../unitable/config/unitableConfig';
import {UniTableColumn} from '../unitable/config/unitableColumn';
import {UniModalService} from '../../uni-modal/modalService';
import {TableDataService} from './services/data-service';
import {TableUtils} from './services/table-utils';
import {ColumnMenuNew} from './column-menu-modal';
import {TableEditor} from './editor/editor';
import {CellRenderer} from './cell-renderer/cell-renderer';
import {ITableFilter, ICellClickEvent, IRowChangeEvent} from './interfaces';

import {
    GridApi,
    ColDef,
    GridReadyEvent,
    ModelUpdatedEvent,
    CellClickedEvent,
    SelectionChangedEvent,
    GridSizeChangedEvent,
    ColumnResizedEvent,
    ColumnMovedEvent,
    RowClickedEvent,
    RowDragEndEvent,
    PaginationChangedEvent
} from 'ag-grid-community';

// Barrel here when we get more?
import {RowMenuRenderer} from './cell-renderer/row-menu';

import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

@Component({
    selector: 'ag-grid-wrapper',
    templateUrl: './ag-grid-wrapper.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TableDataService] // need this to be singleton for every table
})
export class AgGridWrapper {
    @ViewChild('wrapper') public wrapperElement: ElementRef;
    @ViewChild(TableEditor) public editor: TableEditor;

    @Input() public config: UniTableConfig;
    @Input() public columnSumResolver: (params: URLSearchParams) => Observable<{[field: string]: number}>;

    @Input() public resource: any[] | ((params: URLSearchParams) => Observable<any>);
    @Output() public resourceChange: EventEmitter<any[]> = new EventEmitter(false); // double binding

    @Output() public columnsChange: EventEmitter<UniTableColumn[]> = new EventEmitter(false);
    @Output() public rowClick: EventEmitter<any> = new EventEmitter(false);
    @Output() public rowChange: EventEmitter<IRowChangeEvent> = new EventEmitter(false); // TODO: typeme!
    @Output() public rowDelete: EventEmitter<any> = new EventEmitter(false);
    @Output() public rowSelectionChange: EventEmitter<any|any[]> = new EventEmitter(false);
    @Output() public rowSelect: EventEmitter<any> = new EventEmitter(false);
    @Output() public filtersChange: EventEmitter<{filter: string}> = new EventEmitter(false);
    @Output() public filtersChangeWhileGroup: EventEmitter<{filter: string}> = new EventEmitter(false);
    @Output() public dataLoaded: EventEmitter<any> = new EventEmitter(false);
    @Output() public cellClick: EventEmitter<ICellClickEvent> = new EventEmitter(false);

    private configStoreKey: string;
    private agGridApi: GridApi;
    public rowModelType: 'clientSide' | 'infinite';
    public localData: boolean;
    public cacheBlockSize: number;
    public tableHeight: string;
    public usePagination: boolean;
    public selectionMode: string = 'single';
    public paginationInfo: any;
    public allIsExpanded = true;

    public columns: UniTableColumn[];
    private agColDefs: ColDef[];
    public rowClassResolver: (params) => string;

    private colResizeDebouncer$: Subject<ColumnResizedEvent> = new Subject();
    private gridSizeChangeDebouncer$: Subject<GridSizeChangedEvent> = new Subject();
    private rowSelectionDebouncer$: Subject<SelectionChangedEvent> = new Subject();
    private columnMoveDebouncer$: Subject<ColumnMovedEvent> = new Subject();

    private isInitialLoad: boolean = true;

    // Used for custom cell renderers
    public context: any;
    public cellRendererComponents: any;

    isRowSelectable: (rowModel: any) => boolean;

    constructor(
        public dataService: TableDataService,
        private tableUtils: TableUtils,
        private modalService: UniModalService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnInit() {
        this.rowSelectionDebouncer$
            .debounceTime(50)
            .subscribe((event: SelectionChangedEvent) => {
                this.agGridApi.refreshHeader();
                this.rowSelectionChange.emit(event.api.getSelectedRows());
            });

        this.columnMoveDebouncer$
            .debounceTime(1000)
            .subscribe((event: ColumnMovedEvent) => this.onColumnMove(event));

        this.gridSizeChangeDebouncer$
            .debounceTime(200)
            .subscribe(event => {
                this.onGridSizeChange(event);
            });

        this.colResizeDebouncer$
            .debounceTime(200)
            .subscribe(event => {
                this.onColumnResize(event);
            });
    }

    public ngOnDestroy() {
        this.rowSelectionDebouncer$.complete();
        this.columnMoveDebouncer$.complete();
        this.colResizeDebouncer$.complete();
        this.gridSizeChangeDebouncer$.complete();
        this.dataService.sumRow$.complete();
        this.dataService.localDataChange$.complete();
    }

    public ngOnChanges(changes) {
        if (changes['config'] && this.config) {
            this.columns = this.tableUtils.getTableColumns(this.config);
            this.agColDefs = this.getAgColDefs(this.columns);

            if (this.config.conditionalRowCls || this.config.isRowReadOnly || this.config.isRowSelectable) {
                this.rowClassResolver = (params) => {
                    const row = params.data;
                    const classes = [];

                    if (this.config.isRowSelectable && !this.config.isRowSelectable(row)) {
                        classes.push('disabled-row');
                    }

                    if (this.config.editable && this.config.isRowReadOnly) {
                        if (this.config.isRowReadOnly(row)) {
                            classes.push('readonly-row');
                        }
                    }

                    if (this.config.conditionalRowCls) {
                        classes.push(this.config.conditionalRowCls(row));
                    }

                    return classes.join(' ');
                };
            }

            if (this.config.isRowSelectable) {
                this.isRowSelectable = (params) => {
                    const row = params && params.data;
                    if (row) {
                        return this.config.isRowSelectable(row);
                    }

                    return true;
                };
            }
        }

        if (changes['columnSumResolver'] && this.columnSumResolver) {
            this.dataService.columnSumResolver = this.columnSumResolver;
        }
        if (this.config && this.resource && (changes['config'] || changes['resource'])) {
            if (Array.isArray(this.resource)) {
                this.localData = true;
                this.tableHeight = undefined;
                this.rowModelType = 'clientSide';
                this.cacheBlockSize = undefined;
                this.usePagination = this.config.pageable && !this.config.editable && !this.config.rowDraggable;
            } else {
                this.localData = false;
                this.rowModelType = 'infinite';
                this.cacheBlockSize = 50;
                this.tableHeight = 80 + (this.config.pageSize * 35) + 'px';
            }

            if (this.agGridApi) {
                if (this.agGridApi.getSelectedRows().length) {
                    this.agGridApi.deselectAll();
                }

                this.initialize();
            }
        }

        // Resource changed after startup (usually editable table)
        if (this.agGridApi && changes['resource'] && changes['resource'].previousValue) {
            this.dataService.initialize(this.agGridApi, this.config, this.resource);
        }
    }

    private initialize() {
        // Only initialize if we have all required inputs and the config actually changed
        const configChanged = this.config && this.config.configStoreKey !== this.configStoreKey;
        if (configChanged && this.resource && this.agGridApi) {
            this.configStoreKey = this.config.configStoreKey;
            this.dataService.initialize(this.agGridApi, this.config, this.resource);
        }
    }

    public onAgGridReady(event: GridReadyEvent) {
        this.agGridApi = event.api;
        this.agGridApi.sizeColumnsToFit();
        this.initialize();
    }

    public onAgModelUpdate(event: ModelUpdatedEvent) {
        if (this.rowModelType === 'infinite') {
            const state = event.api.getCacheBlockState();
            const loaded = Object.keys(state).every(key => state[key].pageStatus === 'loaded');

            if (loaded) {
                this.onDataLoaded(event.api);
                this.dataLoaded.emit();

                if (this.isInitialLoad) {
                    if (this.config.autofocus) {
                        this.focusRow(0);
                    }

                    if (this.config.multiRowSelect && this.config.multiRowSelectDefaultValue) {
                        this.selectAll();
                    }

                    this.isInitialLoad = false;
                }
                // if (this.config.autofocus && !this.autofocusPerformed) {
                //     this.focusRow(0);
                // }
            }
        } else if (event.newData) {
            event.api.sizeColumnsToFit();
            this.dataLoaded.emit();

            if (this.isInitialLoad) {
                if (this.config.autofocus) {
                    this.focusRow(0);
                }

                if (this.config.multiRowSelect && this.config.multiRowSelectDefaultValue) {
                    this.selectAll();
                }

                this.isInitialLoad = false;
            }



            // if (this.config.autofocus && !this.autofocusPerformed) {
            //     this.focusRow(0);
            // }
        }
    }

    public onDataLoaded(api: GridApi) {
        if (!this.localData) {
            const loadedRowCount = this.dataService.loadedRowCount;

            if (loadedRowCount < this.config.pageSize) {
                if (loadedRowCount > 0) {
                    this.tableHeight = 80 + (loadedRowCount * 35) + 'px';
                } else {
                    this.tableHeight = '95px';
                }
            } else {
                this.tableHeight = 80 + (this.config.pageSize * 35) + 'px';
            }

            setTimeout(() => {
                api.doLayout();
                api.sizeColumnsToFit();
            });
        }
    }

    onGridSizeChange(event: GridSizeChangedEvent) {
        try {
            const body = this.wrapperElement.nativeElement.querySelector('.ag-body-container');
            if (body.clientWidth < event.clientWidth) {
                this.agGridApi.sizeColumnsToFit();
            }
        } catch (e) {
            console.error(e);
        }
    }

    public expandCollapseAll() {
        if (this.allIsExpanded) {
            this.agGridApi.collapseAll();
        } else {
            this.agGridApi.expandAll();
        }
        this.allIsExpanded = !this.allIsExpanded;
        this.config.groupDefaultExpanded = this.allIsExpanded ? -1 : 0;
    }

    public onRowDragEnd(event: RowDragEndEvent) {
        try {
            const originalIndex = event.node.data['_originalIndex'];
            const newIndex = event.overIndex;

            const data = this.dataService.getTableData();
            const row = data.splice(originalIndex, 1)[0];
            data.splice(newIndex, 0, row);

            this.dataService.initialize(this.agGridApi, this.config, data);
            this.resourceChange.emit(data);
        } catch (err) {
            console.error(err);
        }
    }

    public onColumnResize(event: ColumnResizedEvent) {
        if (event.finished) {
            if (event.source === 'autosizeColumns' || event.source === 'uiColumnDragged') {
                const field = event.column.getColId();
                const colIndex = this.columns.findIndex(col => col.field === field);
                if (colIndex >= 0 && this.config.configStoreKey) {
                    this.columns[colIndex].width = event.column.getActualWidth();
                    this.tableUtils.saveColumnSetup(this.config.configStoreKey, this.columns);
                }
            }

            if (this.wrapperElement) {
                const viewport = this.wrapperElement.nativeElement.querySelector('.ag-body-viewport');
                const body = this.wrapperElement.nativeElement.querySelector('.ag-body-container');
                if (body && viewport && body.clientWidth < viewport.clientWidth) {
                    event.api.sizeColumnsToFit();
                }
            }
        }
    }

    public onColumnMove(event: ColumnMovedEvent) {
        if (!this.config || !this.config.configStoreKey || this.config.groupingIsOn) {
            return;
        }

        const colDef = event.column.getColDef();
        const column = colDef && colDef['_uniTableColumn'];
        const index = column && this.columns.findIndex(col => col.field === column.field);
        if (index >= 0) {
            const col = this.columns.splice(index, 1)[0];
            this.columns.splice(event.toIndex, 0, col);
            this.columns = [...this.columns];

            this.tableUtils.saveColumnSetup(this.config.configStoreKey, this.columns);
            this.columnsChange.emit(this.columns);
            this.agColDefs = this.getAgColDefs(this.columns);
            this.cdr.markForCheck();
            setTimeout(() => {
                if (this.agGridApi) {
                    this.agGridApi.sizeColumnsToFit();
                }
            });
        }
    }

    public onRowClick(event: RowClickedEvent) {
        const row = event && event.data;
        if (row && !row['_isSumRow']) {
            this.rowClick.next(event.data);
        }
    }

    public onCellClick(event: CellClickedEvent) {
        if (this.config.editable && this.editor) {

            const colIndex = this.columns
                .filter(col => col.visible)
                .findIndex(col => col.field === event.column.getColId());

            this.editor.activate(event.rowIndex, colIndex);
        }

        const column: UniTableColumn = event.colDef['_uniTableColumn'];

        if (!column) {
            return;
        }

        if (column.onCellClick) {
            column.onCellClick(event.data);
        }

        this.cellClick.emit({
            column: column,
            row: event.data
        });
    }

    selectAll() {
        if (this.config && this.config.multiRowSelect) {
            if (this.rowModelType === 'infinite') {
                this.agGridApi.forEachNode(row => row.setSelected(true));
            } else {
                this.agGridApi.selectAll();
            }
        }
    }

    public paginate(action: 'next' | 'prev' | 'first' | 'last') {
        switch (action) {
            case 'next':
                this.agGridApi.paginationGoToNextPage();
            break;
            case 'prev':
                this.agGridApi.paginationGoToPreviousPage();
            break;
            case 'first':
                this.agGridApi.paginationGoToFirstPage();
            break;
            case 'last':
                this.agGridApi.paginationGoToLastPage();
            break;
        }
    }

    public paginationInputChange(pageNumber: number) {
        this.agGridApi.paginationGoToPage(pageNumber - 1);
    }

    public addAggFunction(func) {
        this.agGridApi.addAggFunc('summing', func);
    }

    public onPaginationChange(event: PaginationChangedEvent) {
        this.paginationInfo = {
            currentPage: event.api.paginationGetCurrentPage() + 1,
            pageCount: event.api.paginationGetTotalPages()
        };
    }

    public onFiltersChange(event) {
        if (this.config.multiRowSelect) {
            this.rowSelectionChange.next([]);
        }

        if (this.config.groupingIsOn) {
            this.filtersChangeWhileGroup.emit(this.dataService.setFilters(event.advancedSearchFilters, event.basicSearchFilters, false));
        } else {
            this.dataService.setFilters(event.advancedSearchFilters, event.basicSearchFilters);
        }

        // TODO: refactor this once every table using it is over on ag-grid
        // Should just emit the filterString, not an object containing it
        this.filtersChange.emit({filter: this.dataService.filterString});
    }

    public onEditorChange(event) {
        let row = event.rowModel;

        if (!this.config.changeCallback) {
            this.dataService.updateRow(row['_originalIndex'], row);
            this.emitChanges({
                rowModel: row,
                field: event.field,
                newValue: event.newValue,
                originalIndex: row['_originalIndex']
            });

            return;
        }

        const updatedRowOrObservableOrPromise = this.config.changeCallback({
            rowModel: row,
            originalIndex: row['_originalIndex'],
            field: event.field,
            newValue: event.newValue
        });

        // Sorry about this.. Copy-paste from old unitable because "support everything, yay!"
        (
            updatedRowOrObservableOrPromise instanceof Observable
                ? updatedRowOrObservableOrPromise.toPromise()
                : Promise.resolve(updatedRowOrObservableOrPromise)
        ).then(updatedRow => {
            if (updatedRow) {
                row = updatedRow;
            }

            this.dataService.updateRow(row['_originalIndex'], row);
            this.emitChanges({
                rowModel: row,
                field: event.field,
                newValue: event.newValue,
                originalIndex: row['_originalIndex']
            });
        }).catch(err => console.error(err));
    }

    private emitChanges(changeEvent /* TODO: type me */) {
        this.resourceChange.emit(this.dataService.getTableData());
        this.rowChange.emit(changeEvent);
    }

    public onLinkClick(column: UniTableColumn, row) {
        if (!column) {
           return;
        }
        if (column.linkClick) {
            column.linkClick(row);
            return;
        }

        let url = column.linkResolver(row);

        if (url && url.length) {
            if (url.includes('mailto:')) {
                window.location.href = url;
            } else if (url.includes('http') || url.includes('www')) {
                if (window.confirm('Du forlater nå Uni Economy')) {
                    if (!url.includes('http')) {
                        url = 'http://' + url;
                    }
                    window.open(url, '_blank');
                }
            } else {
                this.router.navigateByUrl(url);
            }
        } else {
            console.warn('Link resolver did not return any url');
        }
    }

    public onColMenuClick() {
        if (this.editor) {
            this.editor.emitAndClose();
        }

        this.modalService.open(ColumnMenuNew, {
            closeOnClickOutside: true,
            closeOnEscape: true,
            data: {
                columns: this.columns,
                tableConfig: this.config
            }
        }).onClose.subscribe(res => {
            if (res) {
                let columns;
                if (res.resetAll) {
                    columns = this.tableUtils.getTableColumns(this.config);
                    this.tableUtils.removeColumnSetup(this.config.configStoreKey);
                } else {
                    columns = res.columns;
                    this.tableUtils.saveColumnSetup(this.config.configStoreKey, columns);
                }

                this.columns = columns;
                this.columnsChange.emit(this.columns);
                this.agColDefs = this.getAgColDefs(columns);
                this.cdr.markForCheck();
                setTimeout(() => {
                    if (this.agGridApi) {
                        this.agGridApi.sizeColumnsToFit();
                    }
                });
            }
        });
    }

    public onDeleteRow(row) {
        if (this.editor) {
            this.editor.emitAndClose();
        }

        this.dataService.deleteRow(row);
        this.resourceChange.emit(this.dataService.getTableData());
        this.rowDelete.emit(row);
    }

    public onSelectionChange(event: SelectionChangedEvent) {
        if (this.selectionMode === 'multiple') {
            // If we have multirow select run the events through a debouncer.
            // This is done because selecting all rows will trigger one event
            // per row, and we dont need to emit for every row
            this.rowSelectionDebouncer$.next(event);
        } else {
            const selectedRows = event.api.getSelectedRows() || [];
            if (selectedRows.length) {
                this.rowSelectionChange.next(selectedRows[0]);
            }
        }
    }

    public onRowSelected(event) {
        this.rowSelect.emit(event.data);
    }

    private sumTotalInGroup(values) {
        const nums = values.map(value => {
            value = value.toString().replace('\u2009', '').replace(' ', '');
            return isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
        });

        const options = {
            thousandSeparator: '\u2009',
            decimalSeparator: ',',
            decimalLength: 2
        };

        const asMoney = (value) => {
            let stringValue = value.toString().replace(',', '.');
            stringValue = parseFloat(stringValue).toFixed(options.decimalLength);

            let [integer, decimal] = stringValue.split('.');
            integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

            stringValue = decimal ? (integer + options.decimalSeparator + decimal) : integer;

            return stringValue;
        };

        return asMoney(nums.length ? nums.reduce((total, number) =>  total + number ) : 0);
    }

    private getAgColDefs(columns: UniTableColumn[]): ColDef[] {
        if (!columns) {
            return [];
        }

        this.context = { componentParent: this };
        this.cellRendererComponents = {};

        const colDefs = columns.map(col => {

            let cellClass: any = col.cls;
            if (col.conditionalCls) {
                cellClass = (params) => {
                    let cls = col.conditionalCls(params);
                    if (col.cls) {
                        cls += ' ' + col.cls;
                    }
                    return cls;
                };
            }

            const agCol: ColDef = {
                headerName: col.header,
                hide: !col.visible,
                headerClass: col.headerCls,
                cellClass: cellClass,
                headerTooltip: col.header,
                rowGroup: col.rowGroup,
                aggFunc: col.isSumColumn ? this.sumTotalInGroup : null,
                enableRowGroup: col.enableRowGroup,
                tooltip: (params) => this.tableUtils.getColumnValue(params.data, col),
                valueGetter: (params) => this.tableUtils.getColumnValue(params.data, col)
            };

            agCol['_uniTableColumn'] = col;
            if (this.config && this.config.editable) {
                agCol.suppressSorting = true;
            }

            if (!col.resizeable) {
                agCol.suppressResize = true;
                agCol.suppressSizeToFit = true;
                agCol.suppressAutoSize = true;
            }

            if (col.linkResolver || col.linkClick) {
                agCol.cellRenderer = CellRenderer.getLinkColumn(this.onLinkClick.bind(this));
            }

            if (col.tooltipResolver) {
                agCol.cellRenderer = CellRenderer.getTooltipColumn(col);
            }

            if (col.width >= 0) {
                agCol.width = +col.width;
            }

            if (!col.width || col.width >= 64) {
                agCol.minWidth = 64;
            }

            agCol.colId = col.field;

            return agCol;
        });

        if (this.config.multiRowSelect) {
            colDefs.unshift({
                // headerCheckboxSelection: true,
                headerComponent: CellRenderer.getHeaderCheckbox(),
                checkboxSelection: true,
                width: 38,
                suppressSizeToFit: true,
                suppressResize: true,
                suppressSorting: true,
                suppressMovable: true,
            });

            this.selectionMode = 'multiple';
        }

        if (this.config.columnMenuVisible || this.config.deleteButton) {
            const menuColumn: ColDef = {
                headerComponent: this.config.columnMenuVisible ? CellRenderer.getColMenu() : null,
                width: 40,
                pinned: 'right',
                headerClass: 'col-menu',
                cellClass: 'row-menu',
                suppressSizeToFit: true,
                suppressResize: true,
                suppressMovable: true,
            };

            menuColumn['_onClick'] = this.onColMenuClick.bind(this);

            const hasDeleteButton = !!this.config.deleteButton;
            const hasContextMenu = this.config.contextMenu
                && this.config.contextMenu.items
                && this.config.contextMenu.items.length;

            if (hasDeleteButton || hasContextMenu) {
                this.cellRendererComponents.rowMenu = RowMenuRenderer;
                menuColumn.cellRenderer = 'rowMenu';
            }

            if (hasDeleteButton && hasContextMenu) {
                menuColumn.width = 80;
            }

            colDefs.push(menuColumn);
        }

        if (this.config.rowDraggable) {
            colDefs.unshift({
                rowDrag: true,
                width: 45,
                suppressResize: true,
                suppressAutoSize: true,
                suppressSizeToFit: true,
                valueGetter: () => 'Flytt rad',
            });
        }

        return colDefs;
    }

    private isRowReadonly(row) {
        if (!this.config.editable) {
            return true;
        }

        if (this.config.isRowReadOnly && this.config.isRowReadOnly(row)) {
            return true;
        }

        return false;
    }

    public getContextMenuItems(row): any[] {
        const contextMenu = this.config.contextMenu;
        if (contextMenu) {
            const disabled = contextMenu.disableOnReadonlyRows && this.isRowReadonly(row);
            if (!disabled) {
                return contextMenu.items;
            }
        }
    }

    public getDeleteButtonAction(row): ((row) => void) {
        if (this.config.deleteButton) {
            const disabled = this.config.disableDeleteOnReadonly && this.isRowReadonly(row);
            if (!disabled) {
                return this.onDeleteRow.bind(this);
            }
        }
    }

    public getRowIdentifier(row) {
        return row['_guid'];
    }

    // Public functions for host components
    public getTableData() {
        return this.dataService.getTableData(true);
    }

    public getSelectedRows() {
        return (this.agGridApi && this.agGridApi.getSelectedRows()) || [];
    }

    public getRowCount() {
        return this.dataService.loadedRowCount;
    }

    public finishEdit(): Promise<any> {
        return this.editor
            ? this.editor.emitAndClose()
            : Promise.resolve();
    }

    public getCurrentRow() {
        if (this.config.editable && this.editor) {
            return this.editor.currentRow;
        } else {
            const selected = this.agGridApi.getSelectedRows();
            if (selected && selected[0]) {
                return selected[0];
            }
        }
    }

    public selectRow(index: number) {
        try {
            const rowNode = this.agGridApi.getDisplayedRowAtIndex(index || 0);
            if (rowNode) {
                rowNode.setSelected(true);
            }
        } catch (e) {
            console.error('Error in ag-grid-wrapper selectRow()');
        }
    }

    public focusRow(index: number) {
        setTimeout(() => {
            if (!this.agGridApi) {
                return;
            }

            if (!index || index > (this.agGridApi.getDisplayedRowCount() - 1)) {
                index = 0;
            }

            if (this.config.multiRowSelect) {
                try {
                    const col = this.agColDefs.find(colDef => !colDef.hide);
                    this.agGridApi.setFocusedCell(index, col.colId);
                } catch (e) {
                    console.error('Error in ag-grid-wrapper focusRow()');
                }

                return;
            }

            if (this.config.editable) {
                const rowNode = this.agGridApi.getDisplayedRowAtIndex(index);
                if (rowNode && rowNode.data) {
                    const visibleColumns = this.columns.filter(col => col.visible) || [];
                    const colIndex = visibleColumns.findIndex(col => {
                        return (typeof col.editable === 'function')
                            ? col.editable(rowNode.data)
                            : col.editable;
                    });

                    if (colIndex >= 0) {
                        this.editor.activate(index, colIndex);
                    }
                }
            } else {
                const rowNode = this.agGridApi.getDisplayedRowAtIndex(index || 0);
                if (rowNode) {
                    rowNode.setSelected(true);
                }
            }
        });
    }

    public updateRow(originalIndex: number, row) {
        this.dataService.updateRow(originalIndex, row);
        this.resourceChange.emit(this.dataService.getTableData());
        if (this.editor) {
            setTimeout(() => this.editor.resetFocus());
        }
    }

    public addRow(row) {
        this.dataService.addRow(row);
        setTimeout(() => {
            this.focusRow(this.agGridApi.getDisplayedRowCount() - 1);
        });
    }

    public removeRow(originalIndex: number) {
        let nodeToDelete;
        this.agGridApi.forEachNode(node => {
            if (node['_originalIndex'] === originalIndex) {
                nodeToDelete = node;
            }
        });

        if (nodeToDelete) {
            this.dataService.deleteRow(nodeToDelete.data);
        }
    }

    public clearSelection() {
        this.agGridApi.deselectAll();
    }

    /**
     * Refreshes table data. This is only relevant for remote data tables.
     * If you have a local data table you want to use either updateRow(index, data)
     * or give the resource variable a new memory reference to trigger change detection
     * on the entire dataset.
     */
    public refreshTableData() {
        if (this.agGridApi && !this.config.editable) {
            this.dataService.refreshData();
        } else {
            console.warn('No point running refresh on local data table. Use updateRow or give resource input a new reference');
        }
    }

    /**
     * Returns current filters as an array of ITableFilter
     */
    public getAdvancedSearchFilters(): ITableFilter[] {
        return this.dataService.advancedSearchFilters;
    }

    /**
     * Removes all filters on a given field
     * @param {string} field
     */
    public removeFilter(field: string): void {
        this.dataService.removeFilter(field);
    }

    public exportFromGrid() {
        // exportMode will work when we upgrade AG to V20
        const obj: any = {
            exportMode: 'xlsx',
            sheetName: 'Gruppert_export',
            fileName: 'Gruppert_export'
        };

        obj.shouldRowBeSkipped = function(params) {
            if (params.node.group) {
                return false;
            } else if (params.node.parent && params.node.parent.expanded) {
                return false;
            }
            return true;
        };

        this.agGridApi.exportDataAsExcel(obj);
    }
}
