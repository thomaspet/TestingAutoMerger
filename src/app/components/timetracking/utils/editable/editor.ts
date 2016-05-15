import {IJQItem, IPos, IRect, IEditEvents, IEditor } from './interfaces';
declare var jQuery;

const editorTemplate = `<input style='position:absolute; display:none' type='text'></input>`;

const cloneCss = ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					  'text-align', 'font', 'font-size', 'font-family', 'font-weight', 'color'];

export class Editor implements IEditor {
    
    public editEvents: IEditEvents;
    
    private inputBox:IJQItem;
    private position:IPos;
    private originalValue: any;
    
    private handlers = {
        editBlur: undefined,
        editKeydown: undefined        
    }
        
    public destroy() {
        this.inputBox.off('blur', this.handlers.editBlur);
        this.inputBox.off('keydown', this.handlers.editKeydown);
    }
    
    public create(owner:IJQItem):IJQItem {

        if (!this.inputBox) {
            this.inputBox = <IJQItem>jQuery(editorTemplate);
            owner.parent().append(this.inputBox);        
            this.handlers.editBlur = (event) => { this.finalizeEdit(); };
            this.handlers.editKeydown = (event) => { this.onEditKeyDown(event); };
            this.inputBox.on('blur', this.handlers.editBlur);
            this.inputBox.on('keydown', this.handlers.editKeydown);
        }                
        return this.inputBox;         
    }    
    
    public move(rect:IRect) {
        this.inputBox.offset({top: rect.top, left: rect.left});
        if (rect.width) this.inputBox.outerWidth(rect.width);
        if (rect.height) this.inputBox.outerHeight(rect.height);
    }
    
    public startEdit(value:any, cell: IJQItem, pos: IPos) {
        if (!this.inputBox) {
            this.create(cell.parent().parent().parent());
        }
        this.position = pos;
        var styles = cell.css(cloneCss);
        this.inputBox.css(styles);        
        this.originalValue = value;
        this.inputBox.val(value);
        this.moveTo(cell);
        if (!this.inputBox.is(":visible")) {
            this.inputBox.show();
        }
        this.inputBox.select();
    }
    
    public moveTo(cell:IJQItem) {
        var h = cell.outerHeight();
        var w = cell.outerWidth();
        var pos = cell.offset();        
        this.move({left: pos.left, top: pos.top, width: w, height:h});        
    }
    
    public focus() {
        this.inputBox.focus();
    }
    
    public finalizeEdit(cancel = false) {
        if (!(this.editEvents && this.editEvents.onEditChanged)) {
            return;
        }
        var txt = this.inputBox.val();
        if (txt !== this.originalValue) {
            this.editEvents.onEditChanged(txt, this.position);
            this.originalValue = txt; 
        }
    }
    
    public onEditKeyDown(event) {
        if (!(this.editEvents && this.onEditKeyDown)) { return; }
        this.editEvents.onEditKeydown(event);
    }
    
}