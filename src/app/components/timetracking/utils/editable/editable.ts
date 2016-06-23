import {Directive, AfterViewInit, Input, ElementRef, OnDestroy, Output, EventEmitter} from '@angular/core';
import {IJQItem, IPos, IEditor, Keys, IChangeEvent, ICol } from './interfaces';
import {Editor} from './editor';
declare var jQuery; /*: JQueryStatic;*/

export interface IConfig {
    columns?: Array<ICol>;
    events?: {
        onInit?(controller: Editable )
        onChange?(change:IChangeEvent);
        onSelectionChange?(cell: IPos)
    }
}

export {IChangeEvent, ICol, IPos, Column} from './interfaces';


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
    
    constructor(el:ElementRef) {
        this.jqRoot = jQuery(el.nativeElement);
        
        this.handlers.onClick = (event) => { this.startEdit(event); };
        this.handlers.onResize = (event) => { this.onResize(); };
        
        this.jqRoot.on('click', this.handlers.onClick);
        jQuery(window).on('resize', this.handlers.onResize );
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
    }

    public closeEditor(cancel=true) {
        if (this.current.editor)
            this.current.editor.close(cancel);
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
            this.current.active = el;
            this.focusCell(el);
        }
        var txt = el.text();
        this.createEditorIfMissing();
        this.current.editor.startEdit(txt, el, this.getCellPosition(el));
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
            this.current.editor.create(this.jqRoot);
            this.current.editor.editEvents = {
                onEditChanged: (value:any, pos:IPos):boolean => {
                    return this.handleChange(value, pos);
                },
                onEditKeydown: (event) => {
                    this.handleKeydown(event);
                }
            }
        }        
    }

    private handleChange(value:any, pos:IPos):boolean {
        var p2 = this.getCellPosition(this.current.active);
        if (p2.col === pos.col && p2.row === pos.row) {
            var eventDetails: IChangeEvent = { 
                value: value, 
                col: pos.col, 
                row: pos.row, 
                cancel: false,
                updateCell: true,
				columnDefiniton: this.config.columns ? this.config.columns[pos.col] : undefined
            };
            
            var async:Promise<any> = this.raiseEvent("onChange", eventDetails);

            if (async) {
                var cell = this.current.active;
                async.then((value:any)=>{
                    this.loadTextIntoEditor();
                    setTimeout(()=> { this.onResize(); });
                }, (reason)=>{
                    console.log("err:" + reason);
                    cell.css('background-color','#ffe0c0');
                });
            }
            
            if (!eventDetails.cancel) {
                if (eventDetails.updateCell) {
                    console.info(`updating cell value with: ${eventDetails.value}`);
                    this.current.active.text(eventDetails.value);
                    this.onChange.emit(eventDetails);
                }
                return true;
            }
        }
        return false;
    }

    private raiseEvent(name:string, cargo:any):any {
        if (this.config.events.hasOwnProperty(name)) {
            return this.config.events[name](cargo);
        }        
    }

    private handleKeydown(event) {
        var candidate = this.getMovement(this.current.active, event);
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

    private finalizeEdit(cancel = false) {
        if (!this.current.editor) { return true; }
        if (!this.current.editor.hasChanges()) { console.log('no changes!'); return true; }
        if (this.current.editor.finalizeEdit(cancel)) {
            return true;
        }
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

    private getMovement(element:IJQItem, event):IJQItem | Array<any> {
        var target:IJQItem;
        var keyCode = event.which;

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
                break;
            case Keys.END:
                if (event.ctrlKey) {
                    target = element.parent().parent().children().last().children().last();
                } else {
                    target = element.parent().children().last();
                }
                break;
            default:
                return [];
        }

        return target;
    }    
    
}