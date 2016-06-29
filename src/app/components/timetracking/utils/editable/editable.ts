import {Directive, AfterViewInit, Input, ElementRef, OnDestroy, Output, EventEmitter} from '@angular/core';
import {IJQItem, IPos, IEditor, Keys, IChangeEvent, ICol, ColumnType, ITypeSearch } from './interfaces';
import {DropList} from './droplist';
import {Editor} from './editor';
declare var jQuery; /*: JQueryStatic;*/

export interface ICopyEventDetails { event:any; columnDefinition: ICol; position: IPos; copyAbove?: boolean; valueToSet?:any }

export interface IConfig {
    columns?: Array<ICol>;
    events?: {
        onInit?(controller: Editable )
        onChange?(change:IChangeEvent);
        onSelectionChange?(cell: IPos),
        onTypeSearch?(details:ITypeSearch)
        onCopyCell?(details:ICopyEventDetails)
    }
}

export {IChangeEvent, ICol, IPos, Column, ColumnType, ITypeSearch} from './interfaces';


@Directive({
    selector: '[editable]',
    outputs: ['onChange']
})
export class Editable implements AfterViewInit, OnDestroy {

    @Input() config: IConfig;
    public onChange = new EventEmitter();
    private jqRoot: any;
    private handlers = {
        onClick: undefined,   
        onResize: undefined,
        editBlur: undefined      
    }
    private current = {
        active: <IJQItem>undefined,
        editor: <IEditor>undefined
    }
    private dropList = new DropList();
    
    constructor(el:ElementRef) {
        this.jqRoot = jQuery(el.nativeElement);
        
        this.handlers.onClick = (event) => { this.startEdit(event); };
        this.handlers.onResize = (event) => { this.onResize(); };
        
        this.jqRoot.on('click', this.handlers.onClick);
        jQuery(window).on('resize', this.handlers.onResize );

        this.dropList.onClick = (rowIndex: number, item: any, details: ITypeSearch) => {
            var value = item[details.itemPropertyToSet];
            this.dropList.hide();
            this.handleChange(value, this.currentPosition(), false);
        }
    }
    
    public ngAfterViewInit() {
        this.raiseEvent("onInit", this);
    }

    public ngOnDestroy() {
        //cleanup eventhandlers:
        this.jqRoot.off('click', this.handlers.onClick);
        jQuery(window).off('resize', this.handlers.onResize);
        if (this.current.editor) {
            this.current.editor.destroy();
        }
        this.dropList.destroy();
    }

    public closeEditor(cancel=true) {
        if (this.current.editor) {
            this.current.editor.close(cancel);
            this.current.editor.destroy();
        }
        this.dropList.hide();
    }

    public editRow(rowIndex:number) {
        var tb: JQuery = this.jqRoot;
        var cell = tb.find('tr:nth-child(' + rowIndex + ') td:first');
        if (cell) {
            this.startEdit({target: cell});
        }        
    }    

    private onResize() {
        if (!this.current.active) return;
        if (!this.current.editor) return;
        this.current.editor.moveTo(this.current.active);
    }

    private startEdit(event) {
        var el = this.current.active;
        if (event && event.target) {
            el = jQuery(event.target);
            if (!el.is("td")) {
                return;
            }
            this.finalizeEdit();
            this.dropList.hide();
        }

        // detect type of cell
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
                onEditChanged: (value:any, pos:IPos):boolean => {
                    return this.handleChange(value, pos);
                },
                onEditKeydown: (event) => {
                    this.handleKeydown(event);
                },
                onEditTyping: (event, text:string, pos:IPos) => {
                    this.onTypeSearch(text, pos);
                }
            }
            jqInput.on('blur', (event)=>{
                this.whenNoDroplist(null, ()=>{
                    this.current.editor.finalizeEdit(false, undefined, 'blur');
                }, 'blur');
            });
        }        
    }

    whenNoDroplist(target: JQuery, fx: () => void, source = "click") {
        if (!this.dropList.isOpen()) {
            return fx();
        }
        if (target) {
            if (target.closest(".droplist").length === 0) {
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

    private handleChange(value:any, pos:IPos, userTypedValue = true):boolean {

        var eventDetails: IChangeEvent = { 
            value: value, 
            col: pos.col, 
            row: pos.row, 
            cancel: false,
            updateCell: true,
            userTypedValue: userTypedValue,
            columnDefinition: this.config.columns ? this.config.columns[pos.col] : undefined
        };
        
        var async:Promise<any> = this.raiseEvent("onChange", eventDetails);

        if (async) {
            var cell = this.current.active;
            async.then((value:any)=>{
                setTimeout(()=> { 
                    this.onResize();
                    this.loadTextIntoEditor(); 
                });
            }, (reason)=>{
                cell.css('background-color','#ffe0e0');
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

    private raiseEvent(name:string, cargo:any):any {
        if (this.config.events.hasOwnProperty(name)) {
            return this.config.events[name](cargo);
        }        
    }

    private IsLookupCell():boolean {
        var pos = this.getCellPosition(this.current.active);
        var col = this.getLayoutColumn(pos.col)
        if (col) {
            return !!col.lookup;
        }        
    }

    private CheckCopyCell(event:any, newTarget:any) {

        if (event.which === Keys.ENTER) {

            if (this.config && this.config.events && this.config.events.onCopyCell) {
                if (this.current.editor && (!this.current.editor.hasChanges())) {

                    if (this.current.editor.getValue()) return; // only if cell is blank!

                    // Get position?
                    var pos = this.getCellPosition(this.current.active);

                    // Raise event
                    var colDef = this.getLayoutColumn(pos.col);
                    var details:ICopyEventDetails = {
                        event: event,
                        columnDefinition: colDef,
                        position: pos,
                        copyAbove: false
                    }
                    this.raiseEvent('onCopyCell', details);
                    if (details.copyAbove && pos.row>0) {
                        var cellAbove = this.current.active.parent().prev().children().eq(pos.col);
                        if (cellAbove && cellAbove.length>0) {
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

        if (this.checkDroplistNavigation(event)) return;

        if (event.which === Keys.ESC) {
            this.closeEditor(true);
            return;
        }

        // F4 to open dropdown?
        if (event.which === Keys.F4) {
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

        if (candidate.length > 0) {
            if (!this.finalizeEdit()) { 
				return; 
			}
			setTimeout(()=> {
				this.startEdit({ target: candidate[0] });
			});
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        }        
    }

    private currentPosition():IPos {
        if (this.current && this.current.active) {
            return this.getCellPosition(this.current.active);
        }
        return { col: -1, row: -1 };
    }

    private onTypeSearch(value: string, pos?: IPos) {
        pos = pos || this.getCellPosition(this.current.active);
        var details:ITypeSearch = {
            value: value,
            position: pos,
            ignore: true,
            columnDefinition: this.getLayoutColumn(pos.col)
        }
        this.raiseEvent("onTypeSearch", details);
        if (!details.ignore) {            
            this.showTypeSearch(details);
        }
    }

    private showTypeSearch(details:ITypeSearch) {
        this.dropList.setParentElement(this.current.active);
        this.dropList.show(details);
    }

    private finalizeEdit(cancel = false, useThisValue?:string ) {
        if (!this.current.editor) { return true; }
        this.dropList.hide();
        if (useThisValue===undefined && (!this.current.editor.hasChanges())) { return true; }        
        if (this.current.editor.finalizeEdit(cancel, useThisValue, 'parentFinalize')) {
            return true;
        }
    }

    private getLayoutColumn(colIndex:number):ICol {
        return this.config.columns ? this.config.columns[colIndex] : undefined;
    }
        
    private focusCell(cell:IJQItem) {
        if (!cell.attr('tabindex')) {
            var ix = this.calcCellTabindex(cell);
            cell.attr("tabindex", ix);                
        }
        cell.focus();
    }

    private calcCellTabindex(cell:IJQItem) {
        var pos = this.getCellPosition(cell);
        return ((pos.row * 50) + pos.col) + 1000;
    }    

    private getCellPosition(cell:IJQItem): IPos {
        return {
            row: cell.parent().index(),
            col: cell.index()
        };        
    }

    private getMovement(element:IJQItem, event, counter = 0):IJQItem | Array<any> {
        var target:IJQItem;
        var keyCode = event.which;
        var retryIfReadOnly = true;
        var retryWithKey:number;

        switch (keyCode) {
            case Keys.ARROW_RIGHT:
                target = element.next('td');
                break;
            case Keys.ARROW_LEFT:
                target = element.prev('td');
                break;
            case Keys.ARROW_UP:
                target = element.parent().prev().children().eq(element.index());
                break;
            case Keys.ARROW_DOWN:
                target = element.parent().next().children().eq(element.index());
                break;
            case Keys.TAB:
            case Keys.ENTER:
                if (event.shiftKey) {
                    target = element.prev('td');
                    if (target.length === 0) target = element.parent().prev().children().last();
                } else {
                    target = element.next('td');
                    if (target.length === 0) target = element.parent().next().children().eq(0);
                }
                break;
            case Keys.HOME:
                if (event.ctrlKey) {
                    target = element.parent().parent().children().first().children().eq(0);
                } else {
                    target = element.parent().find("td:nth-child(1)");
                }
                retryIfReadOnly = false;
                retryWithKey = Keys.ARROW_RIGHT;
                break;
            case Keys.END:
                if (event.ctrlKey) {
                    target = element.parent().parent().children().last().children().last();
                } else {
                    target = element.parent().children().last();
                }
                retryIfReadOnly = false;
                retryWithKey = Keys.ARROW_LEFT;
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

    isReadOnly(cell:IJQItem, colIndex?:number):boolean {
        var pos:IPos;
        var col = colIndex;
        if (!cell) return false;        
        if (colIndex===undefined) {
            pos = this.getCellPosition(cell);
            col = pos ? pos.col : -1;
        }
        if (col<0 || col === undefined) return true;
        var colDef = this.getLayoutColumn(col);
        if (colDef && colDef.columnType === ColumnType.Action) {
            return true;
        }
        return false;        
    }

    checkDroplistNavigation(event: JQueryInputEventObject): boolean {
        if (!this.dropList.isOpen()) return false;
        var key = event.which;
        switch (key) {
            case Keys.ESC:
                this.dropList.hide();
                return true;

            case Keys.TAB:
            case Keys.ENTER:
                var rowIndex = this.dropList.getCurrentRowIndex();
                if (rowIndex >= 0) {
                    if (!event.shiftKey) {
                        return this.dropList.raiseClickEvent(rowIndex);
                    }
                }
                break;

            case Keys.ARROW_DOWN:
            case Keys.ARROW_UP:
                return this.dropList.navigate(key);
        }
        return false;
    }    
    
}