import {Component, Input, Output, EventEmitter, OnChanges, ElementRef, ViewChild, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {fromEvent, Observable} from 'rxjs';
import {map, throttleTime} from 'rxjs/operators';

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
import {StatisticsService} from '../../../app/services/services';
import {FeaturePermissionService} from '@app/featurePermissionService';

export interface IContextMenuItem {
    label: string;
    action: (item?: any) => void;
    disabled?: (item?: any) => boolean;
    class?: string;
}

export interface ITableFilter {
    field: string;
    operator: string;
    value: string | number;
    group?: number;
    selectConfig?: {options: Array<any>, valueField: string, displayField: string};
    isDate?: boolean;
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
    templateUrl: './unitable.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UniTable implements OnChanges {
    @Input() public config: UniTableConfig;

    @Input() private resource: (urlParams: HttpParams ) => any | any[];

    @Output() public rowSelectionChanged: EventEmitter<any> = new EventEmitter();
    @Output() public rowSelected: EventEmitter<any> = new EventEmitter();
    @Output() public cellClick: EventEmitter<ICellClickEvent> = new EventEmitter();
    @Output() public rowChanged: EventEmitter<IRowChangeEvent> = new EventEmitter();
    @Output() public rowDeleted: EventEmitter<any> = new EventEmitter();
    @Output() public filtersChange: EventEmitter<any> = new EventEmitter();
    @Output() public columnsChange: EventEmitter<any> = new EventEmitter();
    @Output() public pageChange: EventEmitter<any> = new EventEmitter();
    @Output() public dataLoaded: EventEmitter<any> = new EventEmitter();
    @Output() public editModeChange: EventEmitter<boolean> = new EventEmitter();
    @Output() public cellFocus: EventEmitter<any> = new EventEmitter();

    @ViewChild(UnitableEditor) private editor: UnitableEditor;
    @ViewChild(UnitableContextMenu) private contextMenu: UnitableContextMenu;
    @ViewChild('tbody') private tbody: any;
    @ViewChild('pager') private pager: UniTablePagination;

    private configStoreKey: string;
    private remoteData: boolean = false;
    private HttpParams: HttpParams;

    private tableDataOriginal: Immutable.List<any>; // for sorting, filtering etc.
    public tableData: Immutable.List<any>;
    public tableColumns: Immutable.List<any>;

    private basicSearchFilters: ITableFilter[];
    private advancedSearchFilters: ITableFilter[];

    private lastFocusPosition: {rowIndex: number, cellIndex: number};
    private lastFocusedCellColumn: any;
    private lastFocusedRowModel: any;
    public currentRowModel: any;

    public rowCount: number;
    private skip: number = 0;
    private sortInfo: ISortInfo;
    private resize$: any;

    public columnSums: {[key: string]: number};

    constructor(
        private utils: UniTableUtils,
        public el: ElementRef,
        private cdr: ChangeDetectorRef,
        private statisticsService: StatisticsService,
        private featurePermissionService: FeaturePermissionService
    ) {}

    // Life-cycle hooks
    public ngOnInit() {
        this.resize$ = fromEvent(window, 'resize').pipe(
            throttleTime(200)
        ).subscribe(() => {
            if (this.lastFocusPosition) {
                this.resetFocusedCell();
            }
        });
    }

    public ngOnDestroy() {
        this.resize$.unsubscribe();
    }

    public ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        if (changes['config'] && this.config) {
            // Check if config store key changed (most likely ticker model changed)
            // and reset filters if it did, to avoid having for example invoice
            // filters on a timetracking table
            if (this.configStoreKey && this.configStoreKey !== this.config.configStoreKey) {
                this.advancedSearchFilters = [];
                this.basicSearchFilters = [];
            }

            this.configStoreKey = this.config.configStoreKey;
        }

        if (this.resource && this.config) {
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
                let columns = (this.config.columns || []).map(configColumn => {
                    const savedColumn = customColumnSetup.find(col => col.field === configColumn.field);
                    if (savedColumn) {
                        return Object.assign({}, configColumn, savedColumn);
                    } else {
                        return configColumn;
                    }
                });

                // if index is specified for any columns, order by it
                if (columns.find(x => x.index >= 0)) {
                   columns = columns.sort((col1, col2) => {
                        const col1Index = col1.index >= 0 ? col1.index : 99;
                        const col2Index = col2.index >= 0 ? col2.index : 99;
                        return col1Index - col2Index;
                    });
                }

                columns = columns.filter(col => this.featurePermissionService.canShowTableColumn(col));
                this.tableColumns = this.utils.makeColumnsImmutable(columns);
            } else {
                this.tableColumns = this.utils.makeColumnsImmutable(this.config.columns);
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
                this.HttpParams = new HttpParams();
            }

            this.filterAndSortTable(true);
        }
    }

    // Event hooks
    private openEditor(cell: HTMLTableElement, column, rowModel) {
        this.currentRowModel = rowModel;
        const rowReadonly = this.config.isRowReadOnly && this.config.isRowReadOnly(rowModel.toJS());
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
            setTimeout(() => {
                this.rowSelected.emit({rowModel: this.lastFocusedRowModel.toJS()});
            }, 200);
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

        this.cellFocus.emit({
            cell: cell,
            rowIndex: rowIndex,
            rowModel: this.lastFocusedRowModel.toJS(),
            column: this.lastFocusedCellColumn.toJS()
        });
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

    public onSelectAllRowsChange(checked: boolean) {
        this.tableData = this.tableData.map((row) => row.set('_rowSelected', checked)).toList();
        this.tableDataOriginal = this.tableDataOriginal.map(row => row.set('_rowSelected', checked)).toList();

        this.rowSelectionChanged.emit(null);
    }

    public onRowSelected(event) {
        const originalIndex = event.rowModel.get('_originalIndex');
        const index = this.tableData.findIndex(item => item.get('_originalIndex') === originalIndex);

        this.tableData = this.tableData.update(index, () => event.rowModel);
        this.tableDataOriginal = this.tableDataOriginal.update(originalIndex, () => event.rowModel);

        this.rowSelectionChanged.emit({rowModel: event.rowModel.toJS()});
    }

    public onDeleteRow(event) {
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

    public onColumnSetupChange(columns) {
        // Save and reset handled in unitable-header.ts
        this.tableColumns = columns;
        this.columnsChange.emit(this.tableColumns.toJS());
    }

    public onFiltersChange(event) {
        // Reset row selection
        if (this.config.multiRowSelect) {
            this.onSelectAllRowsChange(false);
        }

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
        if (this.config.autoAddNewRow && this.config.editable && key !== KeyCodes.ESCAPE && rowIndex === (this.tableData.size - 1)) {
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
    copyFromCellAbove() {
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
        // Make sure date filters are correctly marked
        this.advancedSearchFilters = (this.advancedSearchFilters || []).map(filter => {
            const col = this.tableColumns.find(c => c.get('field') === filter.field);

            filter.isDate = !!col && (
                col.get('type') === UniTableColumnType.DateTime
                || col.get('type') === UniTableColumnType.LocalDate
            );

            return filter;
        });

        // Get filter string
        let filterString = '';
        if (this.remoteData || emitFilterString) {
            const basicFilter = this.utils.getFilterString(this.basicSearchFilters, this.config.expressionFilterValues, 'or');
            const advancedFilter = this.utils.getFilterString(this.advancedSearchFilters, this.config.expressionFilterValues);

            if (basicFilter.length && advancedFilter.length) {
                // extra spaces before/after filters is intentional, missing spaces sometimes causes
                // problems in the api when using functions in filters in parentheses
                filterString = `( ${basicFilter} ) and ( ${advancedFilter} )`;
            } else {
                filterString = (basicFilter.length) ? basicFilter : advancedFilter;
            }
        }

        if (emitFilterString) {
            this.filtersChange.emit({filter: filterString});
        }

        // Remote data filter and sort
        if (this.remoteData) {
            this.HttpParams = this.HttpParams.set('filter', filterString);

            if (this.sortInfo) {
                switch (this.sortInfo.direction) {
                    case 0:
                        this.HttpParams = this.HttpParams.delete('orderby');
                    break;
                    case 1:
                        this.HttpParams = this.HttpParams.set('orderby', this.sortInfo.field + ' asc');
                    break;
                    case -1:
                        this.HttpParams = this.HttpParams.set('orderby', this.sortInfo.field + ' desc');
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
            this.getLocalDataColumnSums();

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

    resetFocusedCell() {
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
            this.HttpParams = this.HttpParams.set('skip', this.skip.toString());
            this.HttpParams = this.HttpParams.set('top', this.config.pageSize.toString());
        }

        this.resource(this.HttpParams).subscribe(
            (response) => {
                this.rowCount = parseInt(response.headers.getAll('count'));
                let numPages = Math.ceil(this.rowCount / this.config.pageSize) || 1;

                if (this.pager && this.pager.currentPage > numPages) {
                    this.pager.goToPage(1);
                }

                let data = response.body;

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

                this.getColumnSums();
            },
            err => console.error(message, err, '\n', message)
        );
    }

    private getLocalDataColumnSums() {
        this.columnSums = undefined;
        const sumColumns = this.tableColumns.filter(col => col.get('isSumColumn')).toJS() || [];

        if (sumColumns && sumColumns.length) {
            const sums = {};
            sumColumns.forEach((col: UniTableColumn, index: number) => {
                sums[col.field] = this.tableData.reduce((sum, row) => {
                    return sum += parseInt(row.get(col.field), 10) || 0;
                }, 0);
            });

            this.columnSums = sums;
        }

        this.cdr.markForCheck();
    }

    private getColumnSums() {
        this.columnSums = undefined;
        let sumColumns = this.tableColumns.filter(col => col.get('isSumColumn')).toJS();

        if (!this.config.entityType || !sumColumns || !sumColumns.length) {
            return;
        }

        let sumSelects = [];
        sumColumns.forEach((col: UniTableColumn, index: number) => {
            col['_selectAlias'] = 'sum' + index;
            sumSelects.push(`sum(${col.field}) as ${col['_selectAlias']}`);
        });

        let odata = `model=${this.config.entityType}&select=${sumSelects.join(',')}`;
        if (this.HttpParams.get('filter')) {
            odata += `&filter=` + this.HttpParams.get('filter');
        }

        this.statisticsService.GetAll(odata).pipe(
            map(res => (res && res.Data && res.Data[0]) || {}),
        ).subscribe(
            sums => {
                let columnSums = {};

                sumColumns.forEach(col => {
                    columnSums[col.field] = sums[col._selectAlias];
                });

                this.columnSums = Object.keys(columnSums).length ? columnSums : undefined;
                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    private makeDataImmutable(data) {
        data.forEach((item, index) => {
            item._originalIndex = index;

            // allow user to send a default value to specify if the row should be selected when loaded
            if (!item._rowSelected) {
                item._rowSelected = this.config.multiRowSelectDefaultValue || false;
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
        this.tableDataOriginal = this.tableDataOriginal.push(Immutable.fromJS(newItem));
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
                this.pager.paginate('prev');

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
                this.pager.paginate('next');

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
        return !!this.tableData ? this.tableData.filterNot((item) => item.get('_isEmpty')).toJS() : [];
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
        if (originalIndex >= 0) {
            setTimeout(() => {
                if (!this.tableData || !this.tableData.size) {
                    return;
                }
                try {
                    const firstVisibleCellIndex = this.tableColumns.findIndex(col  => {
                        return col.get('visible');
                    });

                    const index = this.tableData.findIndex(r => r.get('_originalIndex') === originalIndex);
                    if (index === -1) {
                        return;
                    }
                    const rows = this.tbody.nativeElement.rows;
                    const cell = rows[index].cells[firstVisibleCellIndex];
                    cell.focus();
                } catch (e) {
                    console.error(e);
                }
            });
        } else {
            console.error('You just called focusRow(undefined) on the table, fix please!');
        }
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

