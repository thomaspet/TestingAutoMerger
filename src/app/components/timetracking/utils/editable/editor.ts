import {IJQItem, IPos, IRect, IEditEvents, IEditor } from './interfaces';
import {DomEvents} from './domevents';
import {debounce} from '../utils';
declare var jQuery;

const editorTemplate = `<input style='position:absolute; display:none' type='text'></input>`;

const cloneCss = ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					  'text-align', 'font', 'font-size', 'font-family', 'font-weight', 'color'];

export class Editor implements IEditor {
    
    public editEvents: IEditEvents;
    
    private inputBox:IJQItem;
    private position:IPos;
    private originalValue: any;
    private resetTyping = false;
    
    private domEvents = new DomEvents();
        
    public destroy() {
        if (this.inputBox) {
            this.domEvents.Cleanup();
            this.inputBox.remove();
            this.inputBox = undefined;
        }
    }
    
    public create(owner:IJQItem):IJQItem {

        if (!this.inputBox) {
            this.inputBox = <IJQItem>jQuery(editorTemplate);
            owner.parent().append(this.inputBox);        
            this.domEvents.Create(<any>this.inputBox, 'keydown', (event)=> this.onEditKeyDown(event) );
            this.domEvents.Create(<any>this.inputBox, 'input paste', (evt)=>{
                this.resetTyping = false;
                debounce((evt) => { this.onEditTyping(evt); }, 250, false).call(this);
            });            
        }                
        return this.inputBox;         
    }    
    
    public move(rect:IRect) {
        if (!this.inputBox) return;
        this.inputBox.offset({top: rect.top, left: rect.left});
        if (rect.width) this.inputBox.outerWidth(rect.width);
        if (rect.height) this.inputBox.outerHeight(rect.height);
    }
    
    public startEdit(value:any, cell: IJQItem, pos: IPos) {
        this.resetTyping = true;
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
            setTimeout(()=>this.moveTo(cell),10);
        }
        this.inputBox.select();
    }

    public setValue(value:any) {
        if (!this.inputBox) return;
        this.originalValue = value;
        this.inputBox.val(value);
        if (this.inputBox.is(":visible")) {
            this.inputBox.select();
        }
    }
    
    public moveTo(cell:IJQItem) {
        var h = cell.outerHeight();
        var w = cell.outerWidth();
        var pos = cell.offset();        
        this.move({left: pos.left, top: pos.top, width: w, height:h});        
    }
    
    public focus() {
        if (!this.inputBox) return;        
        this.inputBox.focus();
    }

    public hasChanges():boolean {
        if (!this.inputBox) return false;
        var txt = this.inputBox.val();
        var changes = txt !== this.originalValue;
        return changes;
    }
    
    public finalizeEdit(cancel = false, valueOverride?:string, src = "unknown"):boolean {
        if (!this.inputBox) return;
        if (!(this.editEvents && this.editEvents.onEditChanged)) {
            return true;
        }
        var txt = valueOverride !== undefined ? valueOverride : this.inputBox.val();
        if (txt !== this.originalValue) {
            //console.log("raising changeevent: " + txt);
            if (this.editEvents.onEditChanged(txt, this.position)) {
                this.originalValue = txt;
            } else {
                return false;
            } 
        }
        return true;
    }
    
    public onEditKeyDown(event) {
        if (!(this.editEvents && this.onEditKeyDown)) { return; }
        this.editEvents.onEditKeydown(event);
    }

    private onEditTyping(event) {
        if (!(this.editEvents && this.onEditTyping)) { return; }
        if (this.resetTyping) { return; }
        var value = this.inputBox.val();
        this.editEvents.onEditTyping(event, value, this.position);        
    }

    public close(cancel=true) {
        if (this.inputBox) {
            this.inputBox.hide();
        }
    }
    
}