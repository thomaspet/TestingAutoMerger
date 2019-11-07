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
import {HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {UniTableConfig} from '../unitable/config/unitableConfig';
import {UniTableColumn, UniTableColumnType} from '../unitable/config/unitableColumn';
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
    PaginationChangedEvent,
    RowNode,
    SortChangedEvent,
    GridOptions
} from 'ag-grid-community';

// Barrel here when we get more?
import {RowMenuRenderer} from './cell-renderer/row-menu';

import {Observable, Subscription} from 'rxjs';
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
    @Input() public columnSumResolver: (params: HttpParams) => Observable<{[field: string]: number}>;
    @Input() public useSpinner = false;
    @Input() public resource: any[] | ((params: HttpParams) => Observable<any>);
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

    agGridApi: GridApi;
    agColDefs: ColDef[];
    agTranslations: any;
    rowClassResolver: (params) => string;

    rowHeight = 45;
    markedRowCount: number = 0;
    sumMarkedRows: any = 0;

    rowModelType: 'clientSide' | 'infinite';
    localData: boolean;
    cacheBlockSize: number;
    tableHeight: string;
    flex: string = '1';
    usePagination: boolean;
    selectionMode: string = 'single';
    paginationInfo: any;
    allIsExpanded = true;
    columns: UniTableColumn[];

    private colResizeDebouncer$: Subject<ColumnResizedEvent> = new Subject();
    private gridSizeChangeDebouncer$: Subject<GridSizeChangedEvent> = new Subject();
    private rowSelectionDebouncer$: Subject<SelectionChangedEvent> = new Subject();
    private columnMoveDebouncer$: Subject<ColumnMovedEvent> = new Subject();
    private sumRowSubscription: Subscription;

    private isInitialLoad: boolean = true;
    public suppressRowClick: boolean = false;
    public sumColName: string = '';

    // Used for custom cell renderers
    public context: any;
    public cellRendererComponents: any = {rowMenu: RowMenuRenderer};

    isRowSelectable: (rowModel: any) => boolean;

    groupingEnabled: boolean;
    aggregator: (nodes: RowNode[]) => any;
    constructor(
        public dataService: TableDataService,
        private tableUtils: TableUtils,
        private modalService: UniModalService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngOnInit() {
        this.agTranslations = {
            rowGroupColumnsEmptyMessage: 'Dra kolonner her for å gruppere',
            noRowsToShow: 'Ingen rader å vise',
            loadingOoo: 'Laster data...'
        };

        this.rowSelectionDebouncer$
            .debounceTime(50)
            .subscribe((event: SelectionChangedEvent) => {
                this.agGridApi.refreshHeader();
                const rows = event.api.getSelectedRows();
                this.markedRowCount = rows ? rows.length : 0;
                this.sumMarkedRows = (rows && this.sumColName) ? this.sumTotalInGroup(rows.map(row => row[this.sumColName])) : 0;
                this.rowSelectionChange.emit(rows);
                this.cdr.markForCheck();
            });

        this.columnMoveDebouncer$
            .debounceTime(1000)
            .subscribe((event: ColumnMovedEvent) => this.onColumnMove(event));

        this.gridSizeChangeDebouncer$
            .debounceTime(200)
            .subscribe(() => this.agGridApi.sizeColumnsToFit());

        this.colResizeDebouncer$
            .debounceTime(200)
            .subscribe(event => this.onColumnResize(event));

        this.sumRowSubscription = this.dataService.sumRow$.subscribe(() => this.calcTableHeight());
    }

    public ngOnDestroy() {
        this.rowSelectionDebouncer$.complete();
        this.columnMoveDebouncer$.complete();
        this.colResizeDebouncer$.complete();
        this.gridSizeChangeDebouncer$.complete();
        this.dataService.sumRow$.complete();
        this.dataService.localDataChange$.complete();
        this.sumRowSubscription.unsubscribe();
    }

    public ngOnChanges(changes) {
        if (changes['config'] && this.config) {
            this.rowHeight = this.config.editable ? 45 : 50;
            const sumCols = this.config.columns.filter(col => col.markedRowsSumCol);

            if (sumCols && sumCols.length) {
                this.sumColName = sumCols[0].alias || sumCols[0].field;
            }
            this.columns = this.tableUtils.getTableColumns(this.config);
            this.agColDefs = this.getAgColDefs(this.columns);

            this.groupingEnabled = this.config.isGroupingTicker || this.columns.some(col => col.rowGroup);
            if (this.groupingEnabled) {
                this.aggregator = nodes => this.groupSumAggregator(nodes);
            }

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
                this.tableHeight = 81 + (this.config.pageSize * this.rowHeight) + 'px';
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
                this.onDataLoaded();
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
        }
    }

    public onDataLoaded() {
        if (!this.localData) {
            if (this.dataService.loadedRowCount) {
                this.agGridApi.hideOverlay();
            } else {
                this.agGridApi.showNoRowsOverlay();
            }

            this.calcTableHeight();

            setTimeout(() => {
                this.dataService.isDataLoading = false;
            });
        }
    }

    private calcTableHeight() {
        if (this.config && !this.localData) {
            const rowCount = this.dataService.loadedRowCount || 0;
            const pageSize = this.config.pageSize || 20;
            const hasSumRow = !!this.dataService.sumRow$.value;

            let tableHeight;
            if (rowCount < pageSize) {
                let heightMultiplier = 1 + (rowCount || 1);
                if (hasSumRow) {
                    heightMultiplier += 1;
                }

                tableHeight = (heightMultiplier * this.rowHeight) + 1 + 'px';
            } else {
                let height = (pageSize + 1) * this.rowHeight;
                if (this.dataService.advancedSearchFilters && this.dataService.advancedSearchFilters.length) {
                    height -= 40;
                }

                if (hasSumRow || this.config.showTotalRowCount) {
                    height += this.rowHeight;
                }

                // +20 to make room for horizontal scrollbar
                tableHeight = height + 20 + 'px';
            }

            if (tableHeight !== this.tableHeight) {
                this.tableHeight = tableHeight;
                if (this.agGridApi) {
                    this.agGridApi.doLayout();
                    this.agGridApi.sizeColumnsToFit();
                }
            }
        }
    }

    public expandCollapseAll() {
        if (this.allIsExpanded) {
            this.agGridApi.collapseAll();
        } else {
            this.agGridApi.expandAll();
        }
        this.allIsExpanded = !this.allIsExpanded;
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

                event.api.sizeColumnsToFit();
            }
        }
    }

    public onSortChange(event: SortChangedEvent) {
        const sortModel = event.api.getSortModel();
        if (sortModel && sortModel[0]) {
            this.tableUtils.saveSortModel(this.config.configStoreKey, sortModel[0]);
        } else {
            this.tableUtils.removeSortModel(this.config.configStoreKey);
        }
    }

    public onColumnMove(event: ColumnMovedEvent) {
        if (!event.column || !this.config || !this.config.configStoreKey || this.config.isGroupingTicker) {
            return;
        }

        const colDef = event.column.getColDef();
        const column = colDef && colDef['_uniTableColumn'];
        const index = column && this.columns.findIndex(col => col.field === column.field);
        if (index >= 0) {
            const col = this.columns.splice(index, 1)[0];

            this.columns.splice(event.toIndex, 0, col);
            this.columns = this.columns.map((c, i) => {
                c.index = i;
                return c;
            });

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
                if (this.config.selectOnlyVisible) {
                    this.agGridApi.getRenderedNodes().forEach(row => row.setSelected(true));
                } else {
                    this.agGridApi.selectAll();
                }
            }
        }
    }

    public setRowDragSuppressed(suppress: boolean) {
        if (this.agGridApi) {
            this.agGridApi.setSuppressRowDrag(suppress);
        }
    }

    public setRowClickSuppressed(suppress: boolean) {
        this.suppressRowClick = suppress;
        this.cdr.markForCheck();
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

        if (this.config.isGroupingTicker) {
            this.dataService.setFilters(event.advancedSearchFilters, event.basicSearchFilters, false);
            this.filtersChangeWhileGroup.emit({filter: this.dataService.filterString});
            return;
        } else {
            this.dataService.setFilters(event.advancedSearchFilters, event.basicSearchFilters);
        }

        // TODO: refactor this once every table using it is over on ag-grid
        // Should just emit the filterString, not an object containing it
        this.filtersChange.emit({filter: this.dataService.filterString});
        this.dataService.isDataLoading = true;
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
                if (window.confirm('Du forlater nå applikasjonen')) {
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
                    columns = res.columns.map((col, index) => {
                        col.index = index;
                        return col;
                    });

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

    onColumnRowGroupChanged(event) {
        if (this.config.groupsDefaultExpanded) {
            event.api.expandAll();
            this.allIsExpanded = true;
        }
    }

    private sumTotalInGroup(values) {
        const nums = values.map(value => {
            value = value.toString().replace('\u2009', '').replace(' ', '');
            return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
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
                suppressMenu: true,
                hide: !col.visible,
                headerClass: col.headerCls,
                cellClass: cellClass,
                headerTooltip: col.header,
                rowGroup: col.rowGroup,
                enableRowGroup: col.enableRowGroup,
                tooltip: (params) => this.tableUtils.getColumnValue(params.data, col),
                valueGetter: (params) => {
                    let data = params.data;
                    if (!data && this.groupingEnabled && col.isSumColumn) {
                        data = params.node && params.node.aggData;
                    }

                    return this.tableUtils.getColumnValue(data, col, true);
                },
                cellRenderer: (params) => {
                    if (params.value) {
                        return `<span>${params.value}</span>`;
                    } else if (col.placeholder) {
                        return `<span class="placeholder">${col.placeholder}</span>`;
                    }
                }
            };

            if (col.rowGroup) {
                agCol.hide = true;
            }

            agCol['_uniTableColumn'] = col;
            if (this.config && this.config.editable) {
                agCol.suppressSorting = true;
            }

            if (!col.resizeable) {
                agCol.suppressResize = true;
                agCol.suppressSizeToFit = true;
                agCol.suppressAutoSize = true;
            }

            if (col.type === UniTableColumnType.LocalDate
                || col.type === UniTableColumnType.DateTime
            ) {
                agCol.comparator = (value1, value2, node1, node2) => {
                    return this.tableUtils.dateComparator(node1, node2, col);
                };
            }

            if (col.type === UniTableColumnType.Number
                || col.type === UniTableColumnType.Money
                || col.type === UniTableColumnType.Percent
            ) {
                agCol.comparator = (value1, value2, node1, node2) => {
                    return this.tableUtils.numberComparator(node1, node2, col);
                };
            }

            if (col.linkResolver || col.linkClick) {
                agCol.cellRenderer = CellRenderer.getLinkColumn(col.hasLink, this.onLinkClick.bind(this));
            }

            if (col.tooltipResolver) {
                agCol.cellRenderer = CellRenderer.getTooltipColumn(col);
            }

            if (col.width >= 0) {
                agCol.width = +col.width;
            }

            if (!col.width || col.width >= 100) {
                agCol.minWidth = 100;
            } else {
                agCol.minWidth = <number> col.width;
            }

            agCol.colId = col.field;

            return agCol;
        });

        if (this.config.multiRowSelect) {
            colDefs.unshift({
                // headerCheckboxSelection: true,
                headerComponent: CellRenderer.getHeaderCheckbox(this.config),
                checkboxSelection: true,
                width: 38,
                suppressSizeToFit: true,
                suppressResize: true,
                suppressSorting: true,
                suppressMovable: true,
                headerClass: 'checkbox-cell',
                cellClass: 'checkbox-cell'
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
                cellClass: 'row-drag-cell'
            });
        }

        return colDefs;
    }

    private groupSumAggregator(nodes) {
        const sumColumns = this.columns.filter(col => col.isSumColumn);
        const rows = nodes.map(node => node.data).filter(x => !!x);

        if (rows && rows.length) {
            const aggregationResults = {};
            sumColumns.forEach(col => {
                let colSum;
                if (col.aggFunc) {
                    colSum = col.aggFunc(rows);
                } else {
                    colSum = rows.reduce((sum, row) => {
                        return sum += parseFloat(_.get(row, col.alias || col.field, 0));
                    }, 0);
                }

                aggregationResults[col.alias || col.field] = colSum;
            });
            return aggregationResults;
        } else {
            const groupAggregations = {};
            nodes.forEach(node => {
                if (node.aggData) {
                    Object.keys(node.aggData).forEach(key  => {
                        groupAggregations[key] = (groupAggregations[key] || 0) + node.aggData[key];
                    });
                }
            });

            return groupAggregations;
        }

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
    public getTableData(filtered?: boolean) {
        if (filtered) {
            const rows = [];
            this.agGridApi.forEachNode(row => rows.push(row.data));
            return rows;
        } else {
            return this.dataService.getTableData(true);
        }
    }

    public getSelectedRows() {
        return (this.agGridApi && this.agGridApi.getSelectedRows()) || [];
    }

    public getRowCount() {
        return this.dataService.loadedRowCount;
    }

    getFilterString() {
        return this.dataService.filterString;
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

    selectNext() {
        if (!this.config.multiRowSelect) {
            const selectedNodes = this.agGridApi.getSelectedNodes();
            const index = (selectedNodes && selectedNodes[0].rowIndex) || 0;

            const nextRow = this.agGridApi.getDisplayedRowAtIndex(index + 1);
            if (nextRow) {
                nextRow.setSelected(true);
                this.agGridApi.ensureNodeVisible(nextRow);
            }
        }
    }

    selectPrevious() {
        if (!this.config.multiRowSelect) {
            const selectedNodes = this.agGridApi.getSelectedNodes();
            const index = (selectedNodes && selectedNodes[0].rowIndex) || 0;

            const prevRow = this.agGridApi.getDisplayedRowAtIndex(index - 1);
            if (prevRow) {
                prevRow.setSelected(true);
                this.agGridApi.ensureNodeVisible(prevRow);
            }
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
            if (params.node.group && !params.node.leafGroup) {
                return false;
            } else if (params.node.parent && params.node.parent.expanded) {
                return false;
            }
            return true;
        };

        this.agGridApi.exportDataAsExcel(obj);
    }
}
