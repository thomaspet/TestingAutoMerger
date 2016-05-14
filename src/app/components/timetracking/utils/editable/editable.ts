import {Directive, AfterViewInit, Input, ElementRef, OnDestroy } from '@angular/core';
import {IJQItem, IPos, IEditor, Keys } from './interfaces';
import {Editor} from './editor';
declare var jQuery /*: JQueryStatic;*/


@Directive({
    selector: '[editable]'
})
export class Editable implements AfterViewInit, OnDestroy {

    jqRoot: any;
    handlers = {
        onClick: undefined,   
        onResize: undefined,
        editBlur: undefined      
    }
    current = {
        active: <IJQItem>undefined,
        editor: <IEditor>undefined       
    }
    
    constructor(el:ElementRef) {
        this.jqRoot = jQuery(el.nativeElement);
        
        this.handlers.onClick = (event) => { this.startEdit(event); };
        this.handlers.onResize = (event) => { this.onResize(event); };
        
        this.jqRoot.on('click', this.handlers.onClick);
        jQuery(window).on('resize', this.handlers.onResize );
    }
    
    public ngAfterViewInit() {
    }

   public ngOnDestroy() {
       //cleanup eventhandlers:
       this.jqRoot.off('click', this.handlers.onClick);
       jQuery(window).off('resize', this.handlers.onResize);
       if (this.current.editor) {
            this.current.editor.destroy();
       }
    }
    
    private onResize(event) {
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
        console.log(`reading '${txt}' from cell'`);
        this.createEditorIfMissing();
        this.current.editor.startEdit(txt, el, this.getCellPosition(el));
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
        console.log(`writing '${value}' to cell ${pos.col}, ${pos.row}'`);
        this.current.active.text(value);
        return true;
    }
    
    private handleKeydown(event) {
        var candidate = this.getMovement(this.current.active, event);
        if (candidate.length > 0) {
            this.startEdit({ target: candidate[0] });
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        }        
    }
    
    private finalizeEdit(cancel = false) {
        if (!this.current.editor) return;
        this.current.editor.finalizeEdit(cancel);
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