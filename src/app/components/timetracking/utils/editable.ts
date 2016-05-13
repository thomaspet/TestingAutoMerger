import {Directive, AfterViewInit, Input, ElementRef, OnDestroy} from '@angular/core';
declare var jQuery;

const cloneCss = ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					  'text-align', 'font', 'font-size', 'font-family', 'font-weight', 'color', 
					  'border', 'border-top', 'border-bottom', 'border-left', 'border-right'];

interface Ijq {
    on(eventName:string, fx:Function);
    off(eventName:string, fx:Function);
    is(tagName:string):boolean;
    text(value?:string):string;
    css(style:any, value?:any);
    val(value?:string):string;
    show();
    attr(name:string, value?:any);
    focus();
    outerHeight(value?:number):number;
    outerWidth(value?:number):number;
    offset(ref?:any):any;
    select();
}

@Directive({
    selector: '[editable]'
})
export class Editable implements AfterViewInit, OnDestroy {
    
    jqRoot: any;
    handlers = {
        onClick: undefined,         
    }
    state = {
        active: <Ijq>undefined,
        editor: <Ijq>undefined,
        combo: <Ijq>undefined
    }
    
    constructor(el:ElementRef) {
        this.jqRoot = jQuery(el.nativeElement);
        
        this.handlers.onClick = (event) => {
            this.startEdit(event);
        };
        
        var ref = this.jqRoot.on('click', this.handlers.onClick);
    }
    
    public ngAfterViewInit() {
        //console.info("afterViewInit(editable)");
    }

   public ngOnDestroy() {
       //cleanup eventhandlers
       this.jqRoot.off('click', this.handlers.onClick);
    }
    
    private startEdit(event) {
        var el = this.state.active;
        if (event && event.target) {
            el = jQuery(event.target);
            if (!el.is("td")) {
                return;
            }
            this.finalizeEdit();
            this.state.active = el;
            //this.focusCell(el);
        }
        var editor = this.makeEditor();
        var styles = el.css(cloneCss);
        editor.val(el.text());
        editor.css(styles);
        this.showEditor(editor, el);
    }
    
    private showEditor(editor:Ijq, cell:Ijq) {
        var h = cell.outerHeight();
        var w = cell.outerWidth();
        editor.offset(cell.offset());
        editor.outerHeight(h);
        editor.outerWidth(w);
        if (!editor.is(':visible')) {
            editor.show();  
        }        
        editor.select();
    }
    
    private makeEditor() {
        if (this.state.editor===undefined) {
            this.state.editor = jQuery("<input style='position:absolute; display:none' type='text'></input>");
            this.jqRoot.parent().append(this.state.editor);            
        }
        return this.state.editor;
    }
    
    private finalizeEdit(cancel = false):boolean {
        var state = this.state;
        if (state.editor) {
            var txt = state.editor.val();
            var original = state.active.text();
            if (original !== txt) {
                state.active.text(txt);
                return true;
            }
        }
        return false;
    }
    
}