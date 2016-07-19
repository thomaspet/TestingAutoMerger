import {Directive, AfterViewInit, Input, ElementRef, OnDestroy, EventEmitter} from '@angular/core';
import {IJQItem, IPos, IEditor, KEYS, IChangeEvent, ICol, ColumnType, ITypeSearch } from './interfaces';
import {DropList} from './droplist';
import {Editor} from './editor';
import {debounce} from '../utils';
declare var $;

export interface ICopyEventDetails { event: any; columnDefinition: ICol; position: IPos; copyAbove?: boolean; valueToSet?: any; };

export interface IConfig {
    columns?: Array<ICol>;
    events?: {
        onInit?(controller: Editable )
        onChange?(change: IChangeEvent);
        onSelectionChange?(cell: IPos),
        onTypeSearch?(details: ITypeSearch)
        onCopyCell?(details: ICopyEventDetails)
    };
}

export {IChangeEvent, ICol, IPos, Column, ColumnType, ITypeSearch, ILookupDetails} from './interfaces';


@Directive({
    selector: '[editable]',
    outputs: ['onChange']
})
export class Editable implements AfterViewInit, OnDestroy {

    @Input() public config: IConfig;
    public onChange: EventEmitter<any> = new EventEmitter();
    private jqRoot: any;
    private handlers: any = {
        onClick: undefined,
        onResize: undefined,
        editBlur: undefined
    };
    private current: any = {
        active: <IJQItem>undefined,
        editor: <IEditor>undefined,
        allowFastNavigation: true,
        navDebouncer: <() => void>undefined
    };
    private dropList: DropList = new DropList();

    constructor(el: ElementRef) {
        this.jqRoot = $(el.nativeElement);

        this.handlers.onClick = (event) => { this.startEdit(event); };
        this.handlers.onResize = (event) => { this.onResize(); };

        this.jqRoot.on('click', this.handlers.onClick);
        $(window).on('resize', this.handlers.onResize );

        this.dropList.onClick = (rowIndex: number, item: any, details: ITypeSearch) => {
            var value = item[details.itemPropertyToSet];
            this.dropList.hide();
            this.handleChange(value, this.currentPosition(), false);
        };
    }

    public getDropListItems(pos?: IPos): Array<any> {
        var ts = this.dropList ? this.dropList.getDetails() : undefined;
        if (ts) {
            if (pos) {
                if (ts.position.col === pos.col && ts.position.row === pos.row) {
                    return this.dropList.getRows();
                }
            } else {
                return this.dropList.getRows();
            }
        }
    }

    public ngAfterViewInit() {
        this.raiseEvent('onInit', this);
    }

    public ngOnDestroy() {
        // cleanup eventhandlers:
        this.jqRoot.off('click', this.handlers.onClick);
        $(window).off('resize', this.handlers.onResize);
        if (this.current.editor) {
            this.current.editor.destroy();
        }
        this.dropList.destroy();
    }

    public closeEditor(cancel= true) {
        if (this.current.editor) {
            this.current.editor.close(cancel);
            this.current.editor.destroy();
        }
        this.dropList.hide();
    }

    public editRow(rowIndex: number, colIndex?: number) {
        var tb: IJQItem = this.jqRoot;
        var query = 'tr:nth-child(' + (rowIndex + 1) + ') ' + (colIndex === undefined ? 'td:first' : 'td:nth(' + (colIndex) + ')') ;
        var cell = tb.find(query);
        if (cell) {
            this.startEdit({target: cell});
        }
    }

    private onResize() {
        if (!this.current.active) { return; }
        if (!this.current.editor) { return; }
        this.current.editor.moveTo(this.current.active);
    }

    private startEdit(event) {
        var el = this.current.active;

        if (event && event.target) {
            el = $(event.target);
            if (!el.is('td')) {
                return;
            }
            this.finalizeEdit();
            this.dropList.hide();
        }

        this.setupTimeoutForFastNavigation();

        var pos = this.getCellPosition(el);
        var col = this.getLayoutColumn(pos.col);
        if (col && col.columnType === ColumnType.Action) {
            return;
        }

        this.current.active = el;
        this.focusCell(el);

        var txt = el.text();
        this.createEditorIfMissing();
        var showButton = col ? !!col.lookup : false;
        this.current.editor.startEdit(txt, el, this.getCellPosition(el), showButton);
    }

    private setupTimeoutForFastNavigation(ms = 250) {
        this.current.allowFastNavigation = true;
        if (!this.current.navDebouncer) {
            this.current.navDebouncer = debounce(() => { this.current.allowFastNavigation = false; }, ms, false);
        }
        this.current.navDebouncer.call(this);
    }

    private loadTextIntoEditor() {
        if (this.current.active) {
            var txt = this.current.active.text();
            this.current.editor.setValue(txt);
        }
    }

    private createEditorIfMissing() {
        if (!this.current.editor) {
            this.current.editor = new Editor();
            var jqInput = this.current.editor.create(this.jqRoot);
            this.current.editor.editEvents = {
                onEditChanged: (value: any, pos: IPos): boolean => {
                    return this.handleChange(value, pos);
                },
                onEditKeydown: (event) => {
                    this.handleKeydown(event);
                },
                onEditTyping: (event, text: string, pos: IPos) => {
                    this.onTypeSearch(text, pos);
                },
                onEditBtnClick: (event, text: string, pos: IPos) => {
                    if (this.dropList.isOpen()) {
                        this.dropList.hide();
                    } else {
                        this.onTypeSearch('', pos);
                    }
                }
            };
            jqInput.on('blur', (event) => {
                this.whenNoDroplist(null, () => {
                    this.current.editor.finalizeEdit(false, undefined, 'blur');
                }, 'blur');
            });
        }
    }

    private whenNoDroplist(target: IJQItem, fx: () => void, source = 'click') {
        if (!this.dropList.isOpen()) {
            return fx();
        }
        if (target) {
            if (target.closest('.droplist').length === 0) {
                return fx();
            }
            if (target.closest('.editable_cellbutton').length === 0) {
                return fx();
            }
        }
        // No target! (lets check delay and check if activeElement is our droplist)
        setTimeout(() => {
            this.whenNoDroplist($(document.activeElement), fx, source);
        });
    }

    private handleChange(value: any, pos: IPos, userTypedValue = true): boolean {

        var eventDetails: IChangeEvent = {
            value: value,
            col: pos.col,
            row: pos.row,
            cancel: false,
            updateCell: true,
            userTypedValue: userTypedValue,
            columnDefinition: this.config.columns ? this.config.columns[pos.col] : undefined
        };

        var async: Promise<any> = this.raiseEvent('onChange', eventDetails);

        if (async) {
            var cell = this.current.active;
            async.then(() => {
                setTimeout(() => {
                    this.onResize();
                    this.loadTextIntoEditor();
                });
            }, (reason) => {
                cell.css('background-color', '#ffe0e0');
            });
        }

        if (!eventDetails.cancel) {
            if (eventDetails.updateCell) {
                this.current.active.text(eventDetails.value);
                this.onChange.emit(eventDetails);
            }
            return true;
        }
    }

    private raiseEvent(name: string, cargo: any): any {
        if (this.config && this.config.events && this.config.events.hasOwnProperty(name)) {
            return this.config.events[name](cargo);
        }
    }

    private IsLookupCell(): boolean {
        var pos = this.getCellPosition(this.current.active);
        var col = this.getLayoutColumn(pos.col);
        if (col) {
            return !!col.lookup;
        }
    }

    private CheckCopyCell(event: any, newTarget: any) {

        if (event.which === KEYS.ENTER) {

            if (this.config && this.config.events && this.config.events.onCopyCell) {
                if (this.current.editor && (!this.current.editor.hasChanges())) {

                    if (this.current.editor.getValue()) { return; } // only if cell is blank!

                    // Get position?
                    var pos = this.getCellPosition(this.current.active);

                    // Raise event
                    var colDef = this.getLayoutColumn(pos.col);
                    var details: ICopyEventDetails = {
                        event: event,
                        columnDefinition: colDef,
                        position: pos,
                        copyAbove: false
                    };
                    this.raiseEvent('onCopyCell', details);
                    if (details.copyAbove && pos.row > 0) {
                        var cellAbove = this.current.active.parent().prev().children().eq(pos.col);
                        if (cellAbove && cellAbove.length > 0) {
                            details.valueToSet = cellAbove.text();
                        }
                    }
                    if (details.valueToSet) {
                        this.current.editor.setValue(details.valueToSet, true);
                    }
                }
            }
        }
    }

    private handleKeydown(event) {

        if (this.checkDroplistNavigation(event)) { return; }

        if (event.which === KEYS.ESC) {
            this.closeEditor(true);
            return;
        }

        // F4 to open dropdown?
        if (event.which === KEYS.F4) {
            if (this.IsLookupCell()) {
                if (this.dropList.isOpen()) {
                    this.dropList.hide();
                    return;
                }
                this.onTypeSearch('');
            }
        }

        var candidate = this.getMovement(this.current.active, event);

        // Enter plus no changes?
        this.CheckCopyCell(event, candidate);

        if (candidate && candidate.length && candidate.length > 0) {
            if (!this.finalizeEdit()) {
                return;
            }

            setTimeout(() => {
                this.startEdit({ target: candidate[0] });
            });

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

        }
    }

    private currentPosition(): IPos {
        if (this.current && this.current.active) {
            return this.getCellPosition(this.current.active);
        }
        return { col: -1, row: -1 };
    }

    private onTypeSearch(value: string, pos?: IPos) {
        pos = pos || this.getCellPosition(this.current.active);
        var details: ITypeSearch = {
            value: value,
            position: pos,
            ignore: true,
            columnDefinition: this.getLayoutColumn(pos.col)
        };
        this.dropList.clear();
        this.raiseEvent('onTypeSearch', details);
        if (!details.ignore) {
            this.showTypeSearch(details);
        }
    }

    private showTypeSearch(details: ITypeSearch) {
        this.dropList.setParentElement(this.current.active);
        this.dropList.show(details);
    }

    private finalizeEdit(cancel = false, useThisValue?: string ) {
        if (!this.current.editor) { return true; }
        this.dropList.hide();
        if (useThisValue === undefined && (!this.current.editor.hasChanges())) { return true; }
        if (this.current.editor.finalizeEdit(cancel, useThisValue, 'parentFinalize')) {
            return true;
        }
    }

    private getLayoutColumn(colIndex: number): ICol {
        return this.config.columns ? this.config.columns[colIndex] : undefined;
    }

    private focusCell(cell: IJQItem) {
        if (!cell.attr('tabindex')) {
            var ix = this.calcCellTabindex(cell);
            cell.attr('tabindex', ix);
        }
        cell.focus();
    }

    private calcCellTabindex(cell: IJQItem) {
        var pos = this.getCellPosition(cell);
        return ((pos.row * 50) + pos.col) + 1000;
    }

    private getCellPosition(cell: IJQItem): IPos {
        return {
            row: cell.parent().index(),
            col: cell.index()
        };
    }

    private getMovement(element: IJQItem, event, counter = 0): IJQItem | Array<any> {
        var target: IJQItem;
        var keyCode = event.which;
        var retryIfReadOnly = true;
        var retryWithKey: number;

        switch (keyCode) {
            case KEYS.ARROW_RIGHT:
                if (!this.current.allowFastNavigation) {
                    let info = caretPosition(event.target);
                    if (!info.isAtEnd) { return; }
                }
                target = element.next('td');
                break;

            case KEYS.ARROW_LEFT:
                if (!this.current.allowFastNavigation) {
                    let info = caretPosition(event.target);
                    if (!info.isAtStart) { return; }
                }
                target = element.prev('td');
                break;

            case KEYS.ARROW_UP:
                target = element.parent().prev().children().eq(element.index());
                break;
            case KEYS.ARROW_DOWN:
                target = element.parent().next().children().eq(element.index());
                break;
            case KEYS.TAB:
            case KEYS.ENTER:
                if (event.shiftKey) {
                    target = element.prev('td');
                    if (target.length === 0) { target = element.parent().prev().children().last(); }
                } else {
                    target = element.next('td');
                    if (target.length === 0) { target = element.parent().next().children().eq(0); }
                }
                break;
            case KEYS.HOME:
                if (!this.current.allowFastNavigation) {
                    let info = caretPosition(event.target);
                    if (!info.isAtStart) { return; }
                }
                if (event.ctrlKey) {
                    target = element.parent().parent().children().first().children().eq(0);
                } else {
                    target = element.parent().find('td:nth-child(1)');
                }
                retryIfReadOnly = false;
                retryWithKey = KEYS.ARROW_RIGHT;
                break;
            case KEYS.END:
                if (!this.current.allowFastNavigation) {
                    let info = caretPosition(event.target);
                    if (!info.isAtEnd) { return; }
                }
                if (event.ctrlKey) {
                    target = element.parent().parent().children().last().children().last();
                } else {
                    target = element.parent().children().last();
                }
                retryIfReadOnly = false;
                retryWithKey = KEYS.ARROW_LEFT;
                break;
            default:
                return [];
        }

        if (counter < 10) {
            if (this.isReadOnly(target) && (retryIfReadOnly || retryWithKey) ) {
                event.which = retryWithKey || event.which;
                counter++;
                return this.getMovement(target, event, counter);
            }
        } else {
            return [];
        }

        return target;
    }

    private isReadOnly(cell: IJQItem, colIndex?: number): boolean {
        var pos: IPos;
        var col = colIndex;
        if (!cell) { return false; }
        if (colIndex === undefined) {
            pos = this.getCellPosition(cell);
            col = pos ? pos.col : -1;
        }
        if (col < 0 || col === undefined) { return true; }
        var colDef = this.getLayoutColumn(col);
        if (colDef && colDef.columnType === ColumnType.Action) {
            return true;
        }
        return false;
    }

    private checkDroplistNavigation(event: any): boolean {
        if (!this.dropList.isOpen()) { return false; }
        var key = event.which;
        switch (key) {
            case KEYS.ESC:
                this.dropList.hide();
                return true;

            case KEYS.TAB:
            case KEYS.ENTER:
                var rowIndex = this.dropList.getCurrentRowIndex();
                if (rowIndex >= 0) {
                    if (!event.shiftKey) {
                        return this.dropList.raiseClickEvent(rowIndex);
                    }
                }
                break;

            case KEYS.ARROW_DOWN:
            case KEYS.ARROW_UP:
                return this.dropList.navigate(key);
        }
        return false;
    }

}

// local module helper functions

function caretPosition(input: any): { index: number; isAtStart: boolean; isAtEnd: boolean; } {
    var hasSelection = false;
    var caretDetails = {
        index: -1,
        isAtStart: false,
        isAtEnd: false
    };
    var doc: any = document;
    if (doc.selection) {
        // IE
        hasSelection = true;
        input.focus();
    }
    if (input.selectionStart || input.selectionEnd) {
        if (input.selectionEnd !== input.selectionStart) {
            hasSelection = true;
        }
    }
    caretDetails.index = 'selectionStart' in input ? input.selectionStart : '' || Math.abs(doc.selection.createRange().moveStart('character', -input.value.length));
    if (!hasSelection) {
        caretDetails.isAtStart = caretDetails.index <= 0;
        caretDetails.isAtEnd = caretDetails.index === input.value.length;
    }
    return caretDetails;
}
