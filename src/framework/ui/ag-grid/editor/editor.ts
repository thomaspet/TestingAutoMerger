import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    ElementRef,
    ApplicationRef,
    Renderer,
    ComponentRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {FormControl} from '@angular/forms';

import {UniTableConfig} from '../../unitable/config/unitableConfig';
import {UniTableColumn, UniTableColumnType} from '../../unitable/config/unitableColumn';
import {TableDataService} from '../services/data-service';
import {TableUtils} from '../services/table-utils';
import {KeyCodes} from '@app/services/common/keyCodes';

import {
    GridApi,
    ColDef,
    IDatasource,
} from 'ag-grid';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import * as _ from 'lodash';
import * as Immutable from 'immutable';

interface IEditorPosition {
    width?: number;
    height?: number;
    top?: number;
    left?: number;
}

@Component({
    selector: 'table-editor',
    templateUrl: './editor.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:click)': 'checkForClickOutside($event)'
    }
})
export class TableEditor {
    @ViewChild('editorContainer', {read: ViewContainerRef})
    private editorContainer: ViewContainerRef;

    @Input() public agGridApi: GridApi;
    @Input() public config: UniTableConfig;
    @Input() public columns: UniTableColumn[];
    @Input() public rowHeight: number;

    @Output()
    public valueChange: EventEmitter<any> = new EventEmitter();

    public moveThrottle: Subject<{
        direction: 'up' | 'down' | 'left' | 'right',
        key?: number
    }> = new Subject();

    private visibleColumns: UniTableColumn[];
    public inputControl: FormControl;
    private editor: ComponentRef<any>;

    public editorVisible: boolean;
    public position: IEditorPosition = {};
    private initValue: string;

    public currentRow: any;
    public currentColumn: any;

    // Key navigation
    public currentRowIndex: number;
    public currentCellIndex: number;

    constructor(
        private dataService: TableDataService,
        private utils: TableUtils,
        private cdr: ChangeDetectorRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private renderer: Renderer,
        private elRef: ElementRef
    ) {
        this.dataService.localDataChange$.subscribe(() => {
            setTimeout(() => {
                if (this.editorVisible) {
                    this.resetFocus();
                }
            });
        });

        this.moveThrottle
            .throttleTime(100)
            .subscribe(event => this.move(event.direction, event.key));
    }

    public ngOnChanges(changes) {
        if (changes['columns'] && this.columns) {
            this.visibleColumns = this.columns.filter(col => col.visible);
        }
    }

    public ngOnDestroy() {
        this.moveThrottle.complete();
    }

    public activate(rowIndex, colIndex: number) {
        this.currentCellIndex = colIndex;
        this.currentRowIndex = rowIndex;

        this.getCellByIndexes(rowIndex, colIndex).subscribe(cell => {
            const rowNode = this.agGridApi.getDisplayedRowAtIndex(rowIndex);
            const row = rowNode && rowNode.data;

            const canActivatePromise = this.editorVisible
                ? this.emitAndClose()
                : Promise.resolve(true);

            canActivatePromise.then(() => {
                if (!row || !cell) {
                    console.warn('Missing row or cell in editor.ts > activate. Something might be broken with editable tables!');
                    return;
                }

                // Make sure there is always an empty row at the bottom
                // if config.autoAddNewRow is true
                const rowCount = this.agGridApi.getDisplayedRowCount();
                if (this.config.autoAddNewRow && rowIndex >= (rowCount - 1)) {
                    this.dataService.addRow();
                }

                this.currentRow = row;
                this.currentColumn = this.visibleColumns && this.visibleColumns[colIndex];

                const isRowReadonly = this.config.isRowReadOnly && this.config.isRowReadOnly(this.currentRow);
                const columnEditable = typeof this.currentColumn.editable === 'function'
                    ? this.currentColumn.editable(this.currentRow)
                    : this.currentColumn.editable;

                if (isRowReadonly || !columnEditable) {
                    return;
                }

                this.position = this.getPositionByCell(cell);
                let editorData = {
                    initValue: this.utils.getColumnValue(this.currentRow, this.currentColumn),
                    initAsDirty: false,
                    column: this.currentColumn,
                    rowModel: this.currentRow,
                    cancel: false
                };

                if (this.config.beforeEdit) {
                    editorData = this.config.beforeEdit(editorData);
                }

                if (!editorData.cancel) {
                    this.openEditor(editorData.initValue, editorData.initAsDirty);
                }
            });

        });


    }

    private openEditor(initValue: string, initAsDirty: boolean) {
        this.initValue = initValue;
        const editorClass = this.currentColumn.editor;
        const factory = this.componentFactoryResolver.resolveComponentFactory(editorClass);
        this.editor = this.editorContainer.createComponent(factory);
        const component = this.editor.instance;

        this.inputControl = new FormControl(initValue || '');
        if (initAsDirty) {
            this.inputControl.markAsDirty();
        }

        component.inputControl = this.inputControl;
        component.rowModel = this.currentRow;

        // Immutable because unitable controls currently use it.
        // Should be re-written to not need immutable
        component.column = Immutable.Map(this.currentColumn);

        setTimeout(() => {
            try {
                this.renderer.invokeElementMethod(component.inputElement.nativeElement, 'focus', []);
                if (this.currentColumn.type !== UniTableColumnType.Select) {
                    this.renderer.invokeElementMethod(component.inputElement.nativeElement, 'select', []);
                }
            } catch (e) {}
        });

        this.editorVisible = true;
        this.cdr.markForCheck();
    }

    public emitAndClose(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getChangeObject(true).subscribe((change) => {
                if (change) {
                    this.valueChange.emit(change);
                }

                resolve(change);
            });
        });
    }

    public getChangeObject(closeEditor: boolean): Observable<any> {
        if (!this.editor) {
            return Observable.of(undefined);
        }

        const rowModel = this.currentRow;
        const field = this.currentColumn.field;
        const value = this.editor.instance.getValue();
        let valueObservable;

        if (closeEditor) {
            this.close();
        }

        if (value && value.then && typeof value.then === 'function') {
            // Value is a promise
            valueObservable =  Observable.fromPromise(value);
        } else if (value && value.subscribe && typeof value.subscribe === 'function') {
            // Value is an observable
            valueObservable = value;
        } else {
            valueObservable = Observable.of(value);
        }

        return valueObservable.switchMap((res) => {
            if (res === undefined) {
                return Observable.of(undefined);
            }

            _.set(rowModel, field, res);
            _.set(rowModel, '_isEmpty', false);

            return Observable.of({
                rowModel: rowModel,
                field: field,
                newValue: res
            });
        });
    }

    public close() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = undefined;
        }

        this.editorVisible = false;
        this.cdr.markForCheck();
    }

    public checkForClickOutside(event) {
        if (this.elRef && !this.elRef.nativeElement.contains(event.target)) {
            this.emitAndClose();
        }
    }

    public resetFocus() {
        this.activate(this.currentRowIndex, this.currentCellIndex);
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        // Blur editor on ctrl + s so host component has the correct value when saving
        if (key === 83 && event.ctrlKey) {
            this.emitAndClose();
            this.dataService.clearEmptyRows();
            return;
        }

        // Check if we should copy from row above
        if (!this.initValue
            && key === KeyCodes.ENTER
            && this.currentRowIndex > 0
            && this.editor
            && this.editor.instance.getValue() === undefined
        ) {
            this.copyFromAbove();
        }

        const inputElement = this.elRef.nativeElement.querySelector('.table-editor input');

        switch (key) {
            case KeyCodes.TAB:
            case KeyCodes.ENTER:
                event.preventDefault();
                event.stopPropagation();
                if (event.shiftKey) {
                    this.moveThrottle.next({direction: 'left'});
                } else {
                    this.moveThrottle.next({direction: 'right', key: key});
                }
            break;
            case KeyCodes.LEFT_ARROW:
                if (this.canMoveLeft(inputElement)) {
                    event.preventDefault();
                    this.moveThrottle.next({direction: 'left'});
                }
            break;
            case KeyCodes.RIGHT_ARROW:
                if (this.canMoveRight(inputElement)) {
                    event.preventDefault();
                    this.moveThrottle.next({direction: 'right', key: key});
                }
            break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (!this.editor || !this.editor.instance.expanded) {
                    this.moveThrottle.next({direction: 'up'});
                }
            break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (!this.editor || !this.editor.instance.expanded) {
                    this.moveThrottle.next({direction: 'down'});
                }
            break;
            case KeyCodes.INSERT:
                if (this.config.insertRowHandler) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.emitAndClose();
                    setTimeout(() => {
                        this.config.insertRowHandler(this.currentRowIndex);
                        setTimeout(() => {
                            this.resetFocus();
                        });
                    });
                }
            break;
            case KeyCodes.ESCAPE:
                this.close();
                this.resetFocus();
            break;
        }
    }

    private move(direction: 'up'|'down'|'left'|'right', keyCode?: number) {
        // REVISIT: simpler way to get table data?
        const data = [];
        this.agGridApi.forEachNode(node => {
            data.push(node.data);
        });

        if (direction  === 'right' && this.visibleColumns[this.currentCellIndex]) {
            // Only jump to column on enter/tab, not right arrow
            if (!keyCode || keyCode !== KeyCodes.RIGHT_ARROW) {
                const jumpToColumn = this.visibleColumns[this.currentCellIndex].jumpToColumn;
                const jumpToIndex = jumpToColumn && this.visibleColumns.findIndex(col => col.field === jumpToColumn);

                if (jumpToIndex >= 0) {
                    this.activate(this.currentRowIndex, jumpToIndex);
                    return;
                }
            }
        }

        let rowIndex: number = this.currentRowIndex;
        let cellIndex: number = this.currentCellIndex;

        switch (direction) {
            case 'up':
                rowIndex = this.getPrevEditableRowIndex(rowIndex - 1, data);
            break;
            case 'down':
                rowIndex = this.getNextEditableRowIndex(rowIndex + 1, data);
            break;
            case 'left':
                cellIndex = this.getPrevEditableCellIndex(cellIndex - 1, data[rowIndex]);
                if (cellIndex === undefined) {
                    rowIndex = this.getPrevEditableRowIndex(rowIndex - 1, data);
                    if (rowIndex >= 0) {
                        cellIndex = this.getPrevEditableCellIndex(
                            this.visibleColumns.length - 1,
                            data[rowIndex]
                        );
                    }
                }
            break;
            case 'right':
                cellIndex = this.getNextEditableCellIndex(cellIndex + 1, data[rowIndex]);
                if (cellIndex === undefined) {
                    rowIndex = this.getNextEditableRowIndex(rowIndex + 1, data);
                    cellIndex = this.getNextEditableCellIndex(0, data[rowIndex]);
                }
            break;
        }

        if (rowIndex >= 0 && cellIndex >= 0) {
            // Check if we should skip this column on enter navigation
            if (keyCode === KeyCodes.ENTER
                && this.visibleColumns[cellIndex]
                && this.visibleColumns[cellIndex].skipOnEnterKeyNavigation
            ) {
                this.currentRowIndex = rowIndex;
                this.currentCellIndex = cellIndex;
                this.move('right', keyCode);
                return;
            } else {
                // const uniColumn = this.visibleColumns[cellIndex];
                // this.agGridApi.ensureColumnVisible(uniColumn.field);
                this.activate(rowIndex, cellIndex);
            }
        }
    }

    private canMoveLeft(inputElement): boolean {
        if (!inputElement || this.currentColumn.type === UniTableColumnType.Select) {
            return true;
        }

        return (
            inputElement.selectionStart === inputElement.selectionEnd
            && inputElement.selectionStart === 0
        );
    }

    private canMoveRight(inputElement): boolean {
        if (!inputElement || this.currentColumn.type === UniTableColumnType.Select) {
            return true;
        }

        return (
            inputElement.selectionStart === inputElement.selectionEnd
            && inputElement.selectionStart === inputElement.value.length
        );
    }

    private getNextEditableRowIndex(lookupStartIndex: number, data: any[]) {
        if (lookupStartIndex >= this.agGridApi.getDisplayedRowCount()) {
            if (this.config.autoAddNewRow) {
                // Add row to grid, and push a dummy row to data variable
                // to make index calculations correct
                this.dataService.addRow();
                data = this.dataService.getViewData();
            } else {
                return;
            }
        }

        if (this.config.isRowReadOnly) {
            const index = data.slice(lookupStartIndex).findIndex(row => {
                return !this.config.isRowReadOnly(row);
            });

            return index >= 0 ? lookupStartIndex + index : undefined;
        } else {
            return lookupStartIndex;
        }
    }

    private getPrevEditableRowIndex(lookupStartIndex: number, data: any[]) {
        if (lookupStartIndex < 0) {
            return;
        }

        if (this.config.isRowReadOnly) {
            const index = data.slice(0, lookupStartIndex + 1).reverse().findIndex(row => {
                return !this.config.isRowReadOnly(row);
            });

            return index >= 0 ? lookupStartIndex - index : undefined;
        } else {
            return lookupStartIndex;
        }
    }

    private getNextEditableCellIndex(lookupStartIndex: number, rowData) {
        if (lookupStartIndex >= this.visibleColumns.length) {
            return;
        }

        const index = this.visibleColumns.slice(lookupStartIndex).findIndex(col => {
            if (typeof col.editable === 'function') {
                return col.editable(rowData);
            } else {
                return col.editable;
            }
        });

        return index >= 0 ? lookupStartIndex + index : undefined;
    }

    private getPrevEditableCellIndex(lookupStartIndex: number, rowData) {
        if (lookupStartIndex < 0) {
            return;
        }

        const columnsReversed = this.visibleColumns.slice(0, lookupStartIndex + 1).reverse();
        const index = columnsReversed.findIndex(col => {
            if (typeof col.editable === 'function') {
                return col.editable(rowData);
            } else {
                return col.editable;
            }
        });

        return index >= 0 ? lookupStartIndex - index : undefined;
    }

    private getPositionByCell(cell: Element) {
        try {
            const wrapper: HTMLElement = this.elRef.nativeElement.parentNode;
            const tableBounds = wrapper.getBoundingClientRect();
            const cellBounds = cell.getBoundingClientRect();
            return {
                top: cellBounds.top - tableBounds.top,
                left: cellBounds.left - tableBounds.left,
                height: cell.clientHeight,
                width: cell.clientWidth
            };

        } catch (e) {
            console.error(e);
            console.warn('Error in editor.ts > getPositionByCell. Editable tables might be broken!');
        }
    }

    private getCellByIndexes(rowIndex: number, cellIndex: number): Observable<Element> {
        if (rowIndex < 0 || cellIndex < 0) {
            return Observable.of(null);
        }

        return Observable.create(observer => {
            const uniColumn = this.visibleColumns[cellIndex];
            if (uniColumn && this.agGridApi) {
                this.agGridApi.ensureColumnVisible(uniColumn.field);
            }

            setTimeout(() => {
                let cell;
                try {
                    const wrapper: HTMLElement = this.elRef.nativeElement.parentNode;

                    const row = wrapper.querySelectorAll('.ag-body-container > .ag-row').item(rowIndex);
                    const cells = row.querySelectorAll('.ag-cell');


                    const field = this.visibleColumns[cellIndex] && this.visibleColumns[cellIndex].field;

                    for (let i = 0; i < cells.length; i++) {
                        if (cells.item(i).getAttribute('col-id') === field) {
                            cell = cells.item(i);
                        }
                    }
                } catch (e) {
                    console.error('Error in editor.ts > getCellByIndexes');
                    console.error(e);
                }

                if (!cell) {
                    console.warn('Could not find cell in editor.ts > getCellByIndexes. Editable tables migth be broken!');
                }

                observer.next(cell);
                observer.complete();
            });
        });
    }

    private copyFromAbove() {
        const data = this.dataService.getViewData();

        const prevRow = data[this.currentRowIndex - 1];
        const field = this.currentColumn.field;
        const value = _.get(prevRow, field);

        if (value) {
            const currentRow = data[this.currentRowIndex];
            _.set(currentRow, field, value);

            this.valueChange.emit({
                rowModel: currentRow,
                field: field,
                newValue: value
            });
        }
    }
}
