import {Component, Input, Output, EventEmitter, OnChanges, HostListener, ElementRef, ViewChild, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/throttleTime';

import {UniTableConfig, IDeleteButton, ISortInfo, IRowChangeEvent} from './config/unitableConfig';
import {UniTableColumn, UniTableColumnType, UniTableColumnSortMode} from './config/unitableColumn';
import {IRowModelChangeEvent} from './unitableRow';
import {UnitableEditor} from './editor/editor';
import {UnitableContextMenu} from './contextMenu';
import {UniTablePagination} from './pagination/pagination';
import {UniTableUtils} from './unitableUtils';
import * as Immutable from 'immutable';
import {List} from 'immutable';
import {KeyCodes} from '../../../app/services/common/keyCodes';

export interface IContextMenuItem {
    label: string;
    action: (item?: any) => void;
    disabled?: (item?: any) => boolean;
}

export interface ITableFilter {
    field: string;
    operator: string;
    value: string | number;
    group: number;
}

export interface IExpressionFilterValue {
    expression: string;
    value: string;
}

export interface ICellClickEvent {
    row: any;
    column: UniTableColumn;
}

enum Direction { UP, DOWN, LEFT, RIGHT }

@Component({
    selector: 'uni-table',
    template: `
        <unitable-search
            *ngIf="config?.searchable"
            [columns]="tableColumns"
            [configFilters]="advancedSearchFilters"
            [allowGroupFilter]="config.allowGroupFilter"
            (filtersChange)="onFiltersChange($event)"
            (upOrDownArrows)="onFilterInputUpOrDownArrows($event)">
        </unitable-search>

        <table *ngIf="tableData && config?.columns"
               [ngClass]="{'editable-table': config.editable}"
               class="unitable-main-table"
               (keydown)="onKeyDown($event)">

            <unitable-editor (valueChange)="onEditorChange($event)"
                             (copyFromAbove)="copyFromCellAbove()">
            </unitable-editor>

            <unitable-contextmenu [items]="config.contextMenu.items"></unitable-contextmenu>

            <thead>
                <tr>
                    <th *ngIf="config.multiRowSelect" class="select-column"><input type="checkbox" #allRowSelector (change)="onSelectAllRowsChanged(allRowSelector.checked)"  /></th>
                    <th *ngFor="let column of tableColumns"
                        [ngStyle]="{
                            'width': column.get('width'),
                            'text-align': column.get('alignment') || 'left'
                        }"
                        bind-class="column.get('headerCls')"
                        [ngClass]="{
                            isSortedAsc: ((column.get('displayField') || column.get('field')) === sortInfo?.field) && (sortInfo?.direction === 1),
                            isSortedDesc: ((column.get('displayField') || column.get('field')) === sortInfo?.field) && (sortInfo?.direction === -1)
                        }"

                        [hidden]="!column.get('visible')"
                        (click)="onSort(column)"
                        [attr.title]="column.get('header')"
                    >
                        {{column.get('header')}}
                    </th>

                    <th *ngIf="config.deleteButton" class="select-column">
                        <unitable-column-menu
                            *ngIf="config?.columnMenuVisible && !config?.contextMenu?.items?.length"
                            [columns]="tableColumns"
                            (columnsChange)="onColumnsChange($event)"
                            (resetAll)="onResetColumnConfig()">
                        </unitable-column-menu>
                    </th>

                    <th *ngIf="config?.contextMenu?.items?.length || (config?.columnMenuVisible && !config?.deleteButton)"
                        class="context-menu-column"
                        [ngClass]="{
                            'select-column': config?.contextMenu?.items?.length > 1 || config?.contextMenu?.showDropdownOnSingleItem
                        }">

                        <unitable-column-menu
                            *ngIf="config?.columnMenuVisible"
                            [columns]="tableColumns"
                            (columnsChange)="onColumnsChange($event)"
                            (resetAll)="onResetColumnConfig()">
                        </unitable-column-menu>

                    </th>
                </tr>
            </thead>
            <tbody #tbody>
                <tr unitable-row
                    *ngFor="let row of getPageData()"
                    [ngClass]="config.conditionalRowCls(row.toJS())"
                    [attr.aria-readonly]="config?.isRowReadOnly(row.toJS())"
                    [attr.aria-selected]="(config.multiRowSelect && row.get('_rowSelected')) || (!config.multiRowSelect && row == lastFocusedRowModel)"
                    [columns]="tableColumns"
                    [rowModel]="row"
                    [config]="config"
                    (rowDeleted)="onDeleteRow($event)"
                    (cellFocused)="onCellFocused($event)"
                    (cellClicked)="onCellClicked($event)"
                    (rowSelectionChanged)="onRowSelected($event)"
                    (contextMenuClicked)="updateContextMenu($event)">
                </tr>
            </tbody>
        </table>

        <unitable-pagination #pager
            *ngIf="config?.pageable && rowCount > config?.pageSize"
            [pageSize]="config.pageSize"
            [rowCount]="rowCount"
            (pageChange)="onPageChange($event)">
        </unitable-pagination>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UniTable implements OnChanges {
    @Input() private config: UniTableConfig;

    @Input() private resource: (urlParams: URLSearchParams ) => any | any[];

    @Output() public rowSelectionChanged: EventEmitter<any> = new EventEmitter();
    @Output() public rowSelected: EventEmitter<any> = new EventEmitter();
    @Output() public cellClick: EventEmitter<ICellClickEvent> = new EventEmitter();
    @Output() public rowChanged: EventEmitter<IRowChangeEvent> = new EventEmitter();
    @Output() public rowDeleted: EventEmitter<any> = new EventEmitter();
    @Output() public filtersChange: EventEmitter<any> = new EventEmitter();
    @Output() public columnsChange: EventEmitter<any> = new EventEmitter();
    @Output() public pageChange: EventEmitter<any> = new EventEmitter();
    @Output() public dataLoaded: EventEmitter<any> = new EventEmitter();

    @ViewChild(UnitableEditor) private editor: UnitableEditor;
    @ViewChild(UnitableContextMenu) private contextMenu: UnitableContextMenu;
    @ViewChild('tbody') private tbody: any;
    @ViewChild('pager') private pager: UniTablePagination;

    private remoteData: boolean = false;
    private urlSearchParams: URLSearchParams;

    private tableDataOriginal: Immutable.List<any>; // for sorting, filtering etc.
    private tableData: Immutable.List<any>;
    private tableColumns: Immutable.List<any>;

    private basicSearchFilters: ITableFilter[];
    private advancedSearchFilters: ITableFilter[];

    private lastFocusPosition: {rowIndex: number, cellIndex: number};
    private lastFocusedCellColumn: any;
    private lastFocusedRowModel: any;
    private currentRowModel: any;

    private rowCount: number;
    private skip: number = 0;
    private sortInfo: ISortInfo;
    private resize$: any;

    constructor(private utils: UniTableUtils, public el: ElementRef, private cdr: ChangeDetectorRef) {}

    // Life-cycle hooks
    public ngOnInit() {
        this.resize$ = Observable.fromEvent(window, 'resize')
            .throttleTime(200)
            .subscribe((event) => {
                if (this.lastFocusPosition) {
                    this.resetFocusedCell();
                }
            });
    }

    public ngOnDestroy() {
        this.resize$.unsubscribe();
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (this.resource && this.config) {

            // if index is specified for any columns, order columns by index
            if (this.config.columns.find(x => x.index !== 0)) {
                this.config.columns = this.config.columns.sort((a, b) => a.index - b.index);
            }

            this.sortInfo = this.config.defaultOrderBy || {
                field: '',
                direction: 0,
                type: UniTableColumnType.Text,
                mode: UniTableColumnSortMode.Normal
            };

            let customColumnSetup;
            if (this.config.configStoreKey) {
                customColumnSetup = this.utils.getColumnSetup(this.config.configStoreKey);
            }

            if (customColumnSetup && customColumnSetup.length) {
                // Extend the default column config with the custom one.
                // Extending because localStorage can't hold functions/components etc
                // So only a set of pre-defined fields are saved
                let columns = [];
                for (let customColumn of customColumnSetup) {
                    let originalCol = this.config.columns.find(c => c.field === customColumn.field);
                    if (originalCol) {
                        columns.push(Object.assign({}, originalCol, customColumn));
                    } else {
                        // If we can't find an original column with the same field
                        // it means either the default config changed or a table with the
                        // same name and different config exists somewhere in the app.
                        // At this point we need to reset in order to avoid crashing
                        this.onResetColumnConfig();
                        columns = this.config.columns;
                        break;
                    }
                }

                this.tableColumns = this.makeColumnsImmutable(columns);
            } else {
                this.tableColumns = this.makeColumnsImmutable(this.config.columns);
            }

            if (this.config.filters) {
                this.advancedSearchFilters = this.config.filters;
            }

            if (Array.isArray(this.resource)) {
                this.makeDataImmutable(this.resource);

                if (this.pager) {
                    this.pager.goToPage(1);
                }
            } else {
                this.remoteData = true;
                this.urlSearchParams = new URLSearchParams();
            }

            this.filterAndSortTable(true);
        }
    }

    @HostListener('document:click', ['$event'])
    private checkForClickOutside(event: MouseEvent) {
        if (!this.el.nativeElement.contains(event.target)) {

            this.lastFocusPosition = undefined;
        }
    }

    // Event hooks
    public onCellFocused(event) {
        const cell = event.target;
        const rowIndex = cell.parentElement.rowIndex - 1;

        if (this.config.autoScrollIfNewCellCloseToBottom) {
            var box = cell.getBoundingClientRect();

            if (box.top + cell.clientHeight + 75 > window.innerHeight) {
                window.scrollTo(0, window.scrollY + 75);
            }
        }

        this.lastFocusedCellColumn = event.column;
        this.lastFocusedRowModel = event.rowModel;

        if (!this.lastFocusPosition || this.lastFocusPosition.rowIndex !== rowIndex) {
            this.rowSelected.emit({rowModel: this.lastFocusedRowModel.toJS()});
        }

        this.lastFocusPosition = {
            rowIndex: rowIndex,
            cellIndex: cell.cellIndex
        };

        // check if the table is editable first
        if (this.config.editable) {
            let rowModel = event.rowModel;

            // if the existing editor is open, close it before continuing
            if (this.editor && this.editor.isOpen) {
                this.editor.emitAndClose();
                rowModel = this.tableDataOriginal.find(x => x.get('_originalIndex') === rowModel.get('_originalIndex'));
            }

            this.openEditor(cell, event.column, rowModel);
        }
    }

    private openEditor(cell: HTMLTableElement, column, rowModel) {
        this.currentRowModel = rowModel;
        let rowReadonly = this.config.isRowReadOnly(rowModel.toJS());
        let columnEditable = column.get('editable') !== false;

        if (typeof column.get('editable') === 'function') {
            columnEditable = !(rowModel && !column.get('editable')(rowModel.toJS()));
        }

        // Stop if row or column is readonly
        if (rowReadonly || !columnEditable) {
            return;
        }

        let editorData = {
            initValue: this.utils.getInitValue(rowModel, column),
            initAsDirty: false,
            column: column.toJS(),
            rowModel: rowModel.toJS(),
            cancel: false
        };

        if (this.config.beforeEdit) {
            editorData = this.config.beforeEdit(editorData);
        }

        if (!editorData.cancel) {
            let position = {
                top: cell.offsetTop + 'px',
                left: cell.offsetLeft + 'px',
                width: cell.offsetWidth + 'px',
                height: cell.offsetHeight + 'px',
                tabIndex: cell.tabIndex
            };

            this.editor.openEditor(
                position,
                column,
                rowModel,
                editorData.initValue,
                editorData.initAsDirty
            );
        }
    }

    public onCellClicked(event) {
        const row = event.rowModel.toJS();
        const col: UniTableColumn = event.column.toJS();

        this.cellClick.next({
            row: row,
            column: col
        });

        if (col.onCellClick) {
            col.onCellClick(row);
        }
    }

    public onEditorChange(event: IRowModelChangeEvent) {
        const originalIndex = event.rowModel.get('_originalIndex');
        const index = this.tableData.findIndex(item => item.get('_originalIndex') === originalIndex);
        let newRowModel = event.rowModel;

        const updatedRowOrObservableOrPromise = this.config.changeCallback && this.config.changeCallback({
            rowModel: newRowModel.toJS(),
            field: event.field,
            newValue: event.newValue,
            originalIndex: originalIndex,
            copyEvent: event.copyEvent
        });

        (
            updatedRowOrObservableOrPromise instanceof Observable
                ? (<Observable<any>>updatedRowOrObservableOrPromise).toPromise()
                : Promise.resolve(updatedRowOrObservableOrPromise)
        )
            .then(updatedRow => {
                if (updatedRow) {
                    newRowModel = Immutable.fromJS(updatedRow);
                }

                // Update currentRowModel (unless we changed rows)
                if (newRowModel.get('_originalIndex') === this.currentRowModel.get('_originalIndex')) {
                    this.currentRowModel = newRowModel;
                }

                // Update table data and reset focus
                this.tableData = this.tableData.update(index, () => newRowModel);
                this.tableDataOriginal = this.tableDataOriginal.update(originalIndex, () => newRowModel);

                if (!event.triggeredByOtherEvent) {
                    this.resetFocusedCell();
                }

                // Emit event to notify subscribers that a row has been changed
                this.rowChanged.emit({
                    rowModel: newRowModel.toJS(),
                    field: event.field,
                    newValue: event.newValue,
                    originalIndex: originalIndex,
                    copyEvent: event.copyEvent
                });

                // Add new empty row if specified in config and this is the last row
                if (this.config.autoAddNewRow && (originalIndex === (this.tableData.size - 1))) {
                    this.addNewRow();
                }
            })
            .catch(() => console.error(
                `Caught error in onEditorChange UniTable`
                + `, this shouldn't happen, error should be caught BEFORE UniTable`
            ));
    }

    private onSelectAllRowsChanged(selected) {
        this.tableData = this.tableData.map((row) => row.set('_rowSelected', selected)).toList();
        this.tableDataOriginal = this.tableDataOriginal.map(row => row.set('_rowSelected', selected)).toList();

        this.rowSelectionChanged.emit(null);
    }

    public onRowSelected(event) {
        const originalIndex = event.rowModel.get('_originalIndex');
        const index = this.tableData.findIndex(item => item.get('_originalIndex') === originalIndex);

        this.tableData = this.tableData.update(index, () => event.rowModel);
        this.tableDataOriginal = this.tableDataOriginal.update(originalIndex, () => event.rowModel);

        this.rowSelectionChanged.emit({rowModel: event.rowModel.toJS()});
    }

    private onDeleteRow(event) {
        // If we dont have a delete handler just remove the row and emit a rowDeleted event
        if (!this.config.deleteButton.hasOwnProperty('deleteHandler')) {
            this.removeRow(event.rowModel.get('_originalIndex'));
            this.resetFocusedCell();
            this.rowDeleted.emit({
                rowModel: event.rowModel.toJS()
            });
            return;
        }

        let deleteResult = (<IDeleteButton> this.config.deleteButton).deleteHandler(event.rowModel.toJS());
        if (deleteResult instanceof Observable) {
            (<Observable<any>> deleteResult).subscribe(
                (success) => {
                    this.removeRow(event.rowModel.get('_originalIndex'));
                    this.resetFocusedCell();
                },
                (error) => {
                    console.log(error);
                });

        } else if (deleteResult && typeof deleteResult === 'boolean') {
            this.removeRow(event.rowModel.get('_originalIndex'));
            this.resetFocusedCell();
        }
    }

    public onColumnsChange(columns) {
        this.tableColumns = columns;

        if (this.lastFocusPosition) {
            this.resetFocusedCell();
        }

        if (this.config.configStoreKey) {
            this.utils.saveColumnSetup(
                this.config.configStoreKey,
                this.tableColumns.toJS()
            );
        }

        this.columnsChange.emit(this.tableColumns.toJS());
    }

    public onResetColumnConfig() {
        if (this.config.configStoreKey) {
            this.utils.removeColumnSetup(this.config.configStoreKey);
        }

        this.tableColumns = this.makeColumnsImmutable(this.config.columns);

        if (this.lastFocusPosition) {
            this.resetFocusedCell();
        }
    }

    private onSort(column) {
        if (!this.config.sortable) {
            return;
        }

        var newDirection = 1;
        let field = column.get('displayField') || column.get('field');

        if (field === this.sortInfo.field) {
            if (this.sortInfo.direction === -1) {
                newDirection = 0;
            } else if (this.sortInfo.direction === 1) {
                newDirection = -1;
            }
        }

        this.sortInfo = {
            field: field,
            direction: newDirection,
            type: column.get('type'),
            mode: column.get('sortMode')
        };

        this.filterAndSortTable();
    }

    public onFiltersChange(event) {
        this.basicSearchFilters = event.basicSearchFilters;
        this.advancedSearchFilters = event.advancedSearchFilters;
        this.lastFocusPosition = undefined;
        this.filterAndSortTable(true);
    }

    public onFilterInputUpOrDownArrows(event: KeyboardEvent) {
        const key = (event.keyCode || event.which);
        if (key === KeyCodes.UP_ARROW) {
            this.moveUpOrDownReadonly(Direction.UP);
        } else if (key === KeyCodes.DOWN_ARROW) {
            this.moveUpOrDownReadonly(Direction.DOWN);
        }
    }


    public onPageChange(page) {
        this.skip = this.config.pageSize * (page - 1);

        if (this.remoteData) {
            this.readRemoteData();
        } else {
            // even though paging doesn't really change the datasource of the table,
            // this event is emitted to make it easy for the parent component to
            // run events to do calculations etc when new data is made visisble
            // in the table. It also makes it more consistent, because if using
            // remote data this event will also be triggered
            setTimeout(() => {
                this.dataLoaded.emit();
            });
        }

        this.pageChange.emit(page);

    }

    private getTableCell(rowIndex: number, field: string): HTMLTableCellElement {
        try {
            const rows = this.tbody.nativeElement.rows;
            const cells = rows[rowIndex].cells || [];

            let cellIndex = this.tableColumns.findIndex(col => col.get('field') === field);
            if (cellIndex >= 0) {
                return cells[cellIndex];
            }
        } catch (e) {
            console.log('Error in unitable: getTableCell', e);
        }
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        // Add new row if we're at the last one as we might need to navigate to it
        let rowIndex = this.lastFocusedRowModel && this.lastFocusedRowModel.get('_originalIndex');
        if (this.config.editable && key !== KeyCodes.ESCAPE && rowIndex === (this.tableData.size - 1)) {
            this.addNewRow();
        }

        // JumpToColumn
        let jumpToColumn = this.lastFocusedCellColumn && this.lastFocusedCellColumn.get('jumpToColumn');
        let isJumpKey = !event.shiftKey && (key === KeyCodes.ENTER || key === KeyCodes.TAB);

        if (jumpToColumn && isJumpKey) {
            let cell = this.getTableCell(this.lastFocusPosition.rowIndex, jumpToColumn);

            if (cell && !cell.hidden) {
                setTimeout(() => {
                    cell.focus();
                });

                return;
            }
        }

        switch (key) {
            // Tab
            case 9:
                event.preventDefault();
                if (event.shiftKey) {
                    this.move(Direction.LEFT, key);
                } else {
                    this.move(Direction.RIGHT, key);
                }
            break;
            // Enter
            case 13:
                if (event.shiftKey) {
                    this.move(Direction.LEFT, key);
                } else {
                    this.move(Direction.RIGHT, key);
                }
            break;
            // End / home
            case 35:
            case 36:
                let row = this.tbody.nativeElement.rows[this.lastFocusPosition.rowIndex];
                let cell = (key === 36)
                    ? this.utils.getFirstFocusableCell(row)
                    : this.utils.getLastFocusableCell(row, this.tableColumns, this.config);

                cell.focus();
            break;
            // Arrow left
            case 37:
                this.move(Direction.LEFT, key);
                event.preventDefault();
            break;
            // Arrow up
            case 38:
                this.move(Direction.UP, key);
                event.preventDefault();
            break;
            // Arrow right
            case 39:
                this.move(Direction.RIGHT, key);
                event.preventDefault();
            break;
            // Arrow down
            case 40:
                this.move(Direction.DOWN, key);
                event.preventDefault();
            break;
            // S
            case 83:
                if (event.ctrlKey) {
                    this.triggerChange();
                }
            break;
            // Insert
            case 45:
                if (event.shiftKey && this.config.editable && this.config.insertRowHandler) {
                    this.blur();
                    setTimeout(() => {
                        this.config.insertRowHandler(this.lastFocusPosition.rowIndex);
                        this.resetFocusedCell();
                    });
                }
            break;
        }
    }

    // Helpers
    private copyFromCellAbove() {
        if (!this.config.copyFromCellAbove) { return; }

        const field = this.lastFocusedCellColumn.get('field');
        let rowIndex = this.lastFocusPosition.rowIndex;
        if (!this.remoteData && this.pager) {
            rowIndex += this.config.pageSize * (this.pager.currentPage - 1);
        }

        const prevRow = this.tableData.get(rowIndex - 1);
        const value = prevRow.getIn(field.split('.'));

        if (value) {
            const currentRow = this.tableData.get(rowIndex);
            this.onEditorChange({
                field: field,
                newValue: value,
                rowModel: currentRow.set(field, value),
                triggeredByOtherEvent: true,
                copyEvent: true
            });
        }
    }

    private filterAndSortTable(emitFilterString: boolean = false) {
        // Get filter string
        var filterString = '';
        if (this.remoteData || emitFilterString) {
            let basicFilter = this.utils.getFilterString(this.basicSearchFilters, this.config.expressionFilterValues, 'or');
            let advancedFilter = this.utils.getFilterString(this.advancedSearchFilters, this.config.expressionFilterValues);

            if (basicFilter.length && advancedFilter.length) {
                filterString = `(${basicFilter}) and (${advancedFilter})`;
            } else {
                filterString = (basicFilter.length) ? basicFilter : advancedFilter;
            }
        }

        if (emitFilterString) {
            this.filtersChange.emit({filter: filterString});
        }

        // Remote data filter and sort
        if (this.remoteData) {
            this.urlSearchParams.set('filter', filterString);

            if (this.sortInfo) {
                switch (this.sortInfo.direction) {
                    case 0:
                        this.urlSearchParams.delete('orderby');
                        break;
                    case 1:
                        this.urlSearchParams.set('orderby', this.sortInfo.field + ' asc');
                        break;
                    case -1:
                        this.urlSearchParams.set('orderby', this.sortInfo.field + ' desc');
                        break;
                }
            }

            this.readRemoteData();
        }
        // Local data filter and sort
        else {
            let hadEmptyRow: boolean = false;
            let data = this.tableDataOriginal;

            if (!data || !data.size) {
                return;
            }

            // Dont include empty row when sorting
            if (data.last().get('_isEmpty')) {
                data = data.pop();
                hadEmptyRow = true;
            }

            // Filter data
            data = this.utils.filterData(data, this.basicSearchFilters, this.config.expressionFilterValues, 'or');
            data = this.utils.filterData(data, this.advancedSearchFilters, this.config.expressionFilterValues, 'and');

            // Sort data
            if (this.sortInfo) {
                data = this.utils.sort(
                    this.sortInfo.field,
                    this.sortInfo.direction,
                    this.sortInfo.type,
                    this.sortInfo.mode,
                    data
                );
            }

            this.tableData = (hadEmptyRow) ? data.push(this.tableDataOriginal.last()) : data;

            // after data is filtered, emit event to notify parent that the data has changed
            setTimeout(() => {
                this.dataLoaded.emit();
            });

            if (!this.remoteData) {
                this.rowCount = this.tableData.size;
            }
        }

        this.cdr.markForCheck();
    }

    private resetFocusedCell() {
        setTimeout(() => {
            let doBlurInstead: boolean = false;
            if (this.lastFocusedCellColumn) {
                let updatedColumn = this.tableColumns.find(x => x.get('field') === this.lastFocusedCellColumn.get('field'));
                doBlurInstead = updatedColumn && !updatedColumn.get('visible');
            }

            if (doBlurInstead) {
                this.blur();
            } else {
                if (this.tbody && this.tbody.nativeElement.rows && this.lastFocusPosition) {
                    const row = this.tbody.nativeElement.rows[this.lastFocusPosition.rowIndex] || {};
                    const cellIndex = this.lastFocusPosition.cellIndex;

                    if (row.cells && row.cells.length >= cellIndex) {
                        row.cells[cellIndex].focus();
                        this.cdr.markForCheck();
                    }
                }
            }
        });
    }

    private updateContextMenu(event) {
        let offsetTop = (event.cell.offsetTop + event.cell.offsetHeight) + 'px';
        this.contextMenu.update(offsetTop, event.rowModel);
    }

    private getPageData(): List<any> {
        if (this.remoteData || !this.config.pageable) {
            return this.tableData;
        }

        return this.tableData
            .skip(this.skip)
            .take(this.config.pageSize)
            .toList();
    }

    private readRemoteData() {
        const message = 'Uncaught error in Unitable! Add a .catch() in the resource / lookup function!';
        if (this.config.pageable) {
            this.urlSearchParams.set('skip', this.skip.toString());
            this.urlSearchParams.set('top', this.config.pageSize.toString());
        }

        this.resource(this.urlSearchParams)
            .subscribe(
                (response) => {
                    this.rowCount = parseInt(response.headers.getAll('count'));
                    let numPages = Math.ceil(this.rowCount / this.config.pageSize) || 1;

                    if (this.pager && this.pager.currentPage > numPages) {
                        this.pager.goToPage(1);
                    }

                    let data = response.json();

                    if (this.config.dataMapper) {
                        data = this.config.dataMapper(data);
                    }

                    this.makeDataImmutable(data);

                    // after data is filtered, emit event to notify parent that the data has changed
                    setTimeout(() => {
                        this.dataLoaded.emit();
                    });

                    if (this.config.editable && this.lastFocusPosition) {
                        this.resetFocusedCell();
                    }
                },
                err => console.error(message, err, '\n', message)
            );
    }

    private makeColumnsImmutable(columns): Immutable.List<any> {
        let immutableColumns = Immutable.List();
        columns.forEach((col) => {
            let map = Immutable.Map(col);
            immutableColumns = immutableColumns.push(map);
        });

        return immutableColumns;
    }

    private makeDataImmutable(data) {
        data.forEach((item, index) => {
            item._originalIndex = index;

            // allow user to send a default value to specify if the row should be selected when loaded
            if (!item._rowSelected) {
                item._rowSelected = false;
            }
        });
        let immutable = Immutable.fromJS(data);

        this.tableData = immutable;
        this.tableDataOriginal = immutable;

        if (this.config.editable && this.config.autoAddNewRow) {
            this.addNewRow();
        }

        this.cdr.markForCheck();
    }

    private addNewRow(rowData?) {
        let newItem = rowData;

        if (!newItem) {
            if (this.config.defaultRowData) {
                newItem = this.config.defaultRowData;
            } else {
                newItem = {};
                this.tableColumns.forEach((col) => {
                    newItem[col.get('field')] = null;
                });
            }

            newItem._isEmpty = true;
        } else {
            // If row is added from externally, assume it is not empty.
            // This is done because otherwise it will be filtered out
            // when retrieving the table's data (among other things)
            newItem._isEmpty = false;
        }

        // allow user to send a default value to specify if the row should be selected when loaded
        if (!newItem._rowSelected) {
            newItem._rowSelected = false;
        }

        newItem._originalIndex = this.tableDataOriginal.count();
        newItem._guid = performance.now();

        this.tableData = this.tableData.push(Immutable.fromJS(newItem));
        this.tableDataOriginal = this.tableDataOriginal.push(Immutable.fromJS(newItem))
        this.rowCount++;
        this.cdr.markForCheck();
    }

    private moveUpOrDownReadonly(direction: Direction) {
        const rows = this.getPageData();
        if (rows.size === 0 || !(direction === Direction.UP || direction === Direction.DOWN)) {
            return;
        }
        const lastRowIndex = rows.size - 1;
        const isUp = direction === Direction.UP;

        if (!this.lastFocusedRowModel) {
            this.lastFocusedRowModel = isUp ? rows.get(lastRowIndex) : rows.get(0);
        } else {
            const lastFocusedIndex = rows.indexOf(this.lastFocusedRowModel);
            const oneRowUp = lastFocusedIndex > 0 ? lastFocusedIndex - 1 : 0;
            const oneRowDown = lastFocusedIndex < lastRowIndex ? lastFocusedIndex + 1 : lastRowIndex;

            this.lastFocusedRowModel = isUp ? rows.get(oneRowUp) : rows.get(oneRowDown);
        }
        this.rowSelected.emit({rowModel: this.lastFocusedRowModel.toJS()});
    }

    private move(direction: Direction, keyCode: number, rowIndex?: number, cellIndex?: number) {
        if (rowIndex === undefined || cellIndex === undefined) {
            if (this.lastFocusPosition) {
                rowIndex = this.lastFocusPosition.rowIndex;
                cellIndex = this.lastFocusPosition.cellIndex;
            }
        }

        try {
            const rows = this.tbody.nativeElement.rows;
            const cells = rows[rowIndex].cells || [];

            // Find new row/cell index
            switch (direction) {
                case Direction.UP:
                    rowIndex--;
                break;
                case Direction.DOWN:
                    rowIndex++;
                break;
                case Direction.LEFT:
                    cellIndex--;
                    if (cellIndex < 0) {
                        rowIndex--;
                        cellIndex = cells.length - 1;
                    }
                break;
                case Direction.RIGHT:
                    cellIndex++;
                    if (cellIndex >= cells.length) {
                        rowIndex++;
                        cellIndex = 0;
                    }
                break;
            }

            // Change page if rowIndex is out of range
            if (rowIndex < 0 || rowIndex >= rows.length) {
                this.outOfPageNavigation(direction);
                return;
            }

            // Focus new cell if focusable, continue moving if not
            const newCell = rows[rowIndex].cells[cellIndex];
            const readonly = newCell.parentElement.getAttribute('aria-readonly') === 'true';
            const columnConfigIndex: number = this.config.multiRowSelect ? cellIndex - 1 : cellIndex;
            const column = this.tableColumns.get(columnConfigIndex);

            if (keyCode === 13 && column && column.get('skipOnEnterKeyNavigation')) {
                // Enter key may skip cells that are focusable/editable to improve performance when entering data
                this.move(direction, keyCode, rowIndex, cellIndex);
            } else if (column && !column.get('visible')) {
                // skip hidden columns
                this.move(direction, keyCode, rowIndex, cellIndex);
            } else if (newCell.tabIndex < 0 || readonly) {
                // skip readonly columns or rows
                this.move(direction, keyCode, rowIndex, cellIndex);
            } else {
                newCell.focus();
            }

        } catch (e) {
            console.log(e);
        }
    }

    private outOfPageNavigation(direction: Direction) {
        if (direction === Direction.UP || direction === Direction.LEFT) {
            if (this.pager && this.pager.currentPage > 1) {
                this.pager.previous();

                setTimeout(() => {
                    const newRow = this.utils.getLastFocusableRow(this.tbody.nativeElement.rows);
                    let newCell;

                    if (direction === Direction.UP) {
                        newCell = newRow.cells[this.lastFocusPosition.cellIndex];
                    } else {
                        newCell = this.utils.getLastFocusableCell(newRow, this.tableColumns, this.config);
                    }

                    newCell.focus();
                });
            }
        } else if (direction === Direction.DOWN || direction === Direction.RIGHT) {
            if (this.pager && this.pager.currentPage < this.pager.pageCount) {
                this.pager.next();

                setTimeout(() => {
                    const newRow = this.utils.getFirstFocusableRow(this.tbody.nativeElement.rows);
                    let newCell;

                    if (direction === Direction.DOWN) {
                        newCell = newRow.cells[this.lastFocusPosition.cellIndex];
                    } else {
                        newCell = this.utils.getFirstFocusableCell(newRow);
                    }

                    newCell.focus();
                });
            }
        }
    }

    // Public methods
    public getSelectedRows() {
        let selectedItems = Immutable.List<any>();

        for (let i = 0; i < this.tableDataOriginal.size; i++) {
            let model = this.tableDataOriginal.get(i);
            if (model.get('_rowSelected')) {
                selectedItems = selectedItems.push(model);
            }
        }

        return selectedItems.toJS();
    }

    public goToPage(pageNo: number) {
        if (this.pager) {
            this.pager.goToPage(pageNo);
        }
    }

    public getRowCount() {
        return this.rowCount;
    }

    public getTableData() {
        return this.tableData.filterNot((item) => item.get('_isEmpty')).toJS();
    }

    public getVisibleTableData() {
        return this.getPageData().filterNot((item) => item.get('_isEmpty')).toJS();
    }

    public refreshTableData() {
        if (this.remoteData) {
            // Filter remote data, use existing filtering (this includes paging, filters, etc)
            this.readRemoteData();
        }
    }

    public finishEdit(): Promise<any> {
        return this.editor.emitAndClose();
    }

    public triggerChange() {
        this.blur();
        this.resetFocusedCell();
    }

    public getRow(originalIndex: number) {
        return this.tableDataOriginal.get(originalIndex).toJS();
    }

    public getCurrentRow() {
        return this.currentRowModel ? this.currentRowModel.toJS() : null;
    }

    public focusRow(originalIndex: number) {
        setTimeout(() => {
            if (!this.tableData || !this.tableData.size) {
                return;
            }

            const firstVisibleCellIndex = this.tableColumns.findIndex(col  => {
                return col.get('visible');
            });

            const index = this.tableData.findIndex(row => row.get('_originalIndex') === originalIndex);
            const rows = this.tbody.nativeElement.rows;
            if (rows && index < rows.length) {
                if (firstVisibleCellIndex >= 0) {
                    rows[index].cells[firstVisibleCellIndex].focus();
                }
            }
        });
    }

    public blur() {
        if (this.editor) {
            this.editor.emitAndClose();
        }
        (<any> document.activeElement).blur();
    }

    public addRow(row) {
        this.addNewRow(row);
        this.filterAndSortTable();
    }

    public updateRow(originalIndex, updatedRow) {
        this.tableDataOriginal = this.tableDataOriginal.update(originalIndex, () => Immutable.fromJS(updatedRow));
        this.filterAndSortTable();
    }

    public removeRow(originalIndex) {
        if (this.tableDataOriginal.get(originalIndex).get('_isEmpty') && originalIndex === 0) {
            return;
        }
        this.tableDataOriginal = this.tableDataOriginal.delete(originalIndex);

        var count = 0;
        this.tableDataOriginal = this.tableDataOriginal.map((row) => row.set('_originalIndex', count++)).toList();
        this.tableData = this.tableDataOriginal;
        this.rowCount--;

        if (this.tableDataOriginal.count() === 0) {
            this.addNewRow();
        } else {
            this.filterAndSortTable();
        }
    }

    /**
     * Adds filters to the table.
     * If there exists a filter with the same field and operator it will be replaced
     * @param {array} filters
     */
    public setFilters(filters: ITableFilter[]): void {
        if (!filters || !filters.length) {
            return;
        }

        // Timeout to avoid change detection timing issues
        setTimeout(() => {
            if (this.advancedSearchFilters) {
                filters.forEach((newFilter) => {
                    const oldFilterIndex = this.advancedSearchFilters.findIndex((filter) => {
                        return filter.field === newFilter.field && filter.operator === newFilter.operator;
                    });

                    if (oldFilterIndex >= 0) {
                        this.advancedSearchFilters[oldFilterIndex] = newFilter;
                    } else {
                        this.advancedSearchFilters.push(newFilter);
                    }

                    this.advancedSearchFilters = [...this.advancedSearchFilters];
                });
            } else {
                this.advancedSearchFilters = filters;
            }

            this.cdr.markForCheck();
            this.filterAndSortTable(true);
        });
    }

    /**
     * Returns current filters as array
     */
    public getAdvancedSearchFilters(): ITableFilter[] {
        return this.advancedSearchFilters;
    }

    /**
     * Removes all filters on a given field
     * @param {string} field
     */
    public removeFilter(field: string): void {
        if (!this.advancedSearchFilters) {
            return;
        }

        this.advancedSearchFilters.forEach((filter, index) => {
            if (filter.field === field) {
                this.advancedSearchFilters.splice(index, 1);
            }
        });

        this.filterAndSortTable(true);
    }

}

