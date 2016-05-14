import {Directive, AfterViewInit, Input, ElementRef, OnDestroy } from '@angular/core';
import {IJQItem, IPos, IEditor } from './interfaces';
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
        this.createEditorIfMissing();
        this.current.editor.startEdit(el.text(), el);
    }
    
    private createEditorIfMissing() {
        if (!this.current.editor) {
            this.current.editor = new Editor();
            this.current.editor.create(this.jqRoot);
            this.current.editor.editEvents = {
                finalizeEdit: (value:any, pos:IPos):boolean => {
                    return this.handleChange(value, pos);
                }
            }
        }        
    }
    
    private handleChange(value:any, pos:IPos):boolean {
        this.current.active.text(value);
        return true;
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
    
}