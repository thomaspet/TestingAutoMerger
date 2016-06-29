import {IJQItem, IPos, IRect, IEditEvents, IEditor } from './interfaces';
import {DomEvents} from './domevents';
import {debounce} from '../utils';
declare var jQuery;

const editorTemplate = `<div style='position:absolute;display:none;white-space:nowrap' class="inline_editor">
    <input type='text'></input><button class='editable_cellbutton'></button>
    </div>`; 

const cloneCss = ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					  'text-align', 'font', 'font-size', 'font-family', 'font-weight', 'color'];

export class Editor implements IEditor {
    
    public editEvents: IEditEvents;
    
    private rootElement:IJQItem;
    private inputBox:IJQItem;
    private button:IJQItem;
    private position:IPos;
    private originalValue: any;
    private resetTyping = false;
    private showButton = false;
    private domEvents = new DomEvents();
        
    public destroy() {
        if (this.rootElement) {
            this.domEvents.Cleanup();
            this.rootElement.remove();            
            this.rootElement = undefined;
            this.inputBox = undefined;
        }
    }
    
    public create(owner:IJQItem):IJQItem {

        if (!this.rootElement) {
            this.rootElement = <IJQItem>jQuery(editorTemplate); 
            owner.parent().append(this.rootElement);        
            this.inputBox = this.rootElement.find("input");
            this.button = this.rootElement.find("button");
            this.domEvents.Create(<any>this.button, 'click', (event) => this.onButtonClick(event) );
            this.domEvents.Create(<any>this.inputBox, 'keydown', (event)=> this.onEditKeyDown(event) );
            this.domEvents.Create(<any>this.inputBox, 'input paste', (evt)=>{
                this.resetTyping = false;
                debounce((evt) => { this.onEditTyping(evt); }, 250, false).call(this);
            });            
        }                
        return this.inputBox;         
    }    
    
    public move(rect:IRect) {
        var el = this.rootElement;
        if (!el) return;
        el.offset({top: rect.top, left: rect.left});
        if (this.showButton) {
            var btw = this.button.outerWidth();
            if (btw < 24) { btw = 24; this.button.outerWidth(btw); }
            this.inputBox.outerWidth(rect.width - btw);
            this.inputBox.outerHeight(rect.height);
            this.button.outerHeight(rect.height);
            if (!this.button.is(":visible")) {
                this.button.show();
            }
        } else {
            this.inputBox.outerWidth(rect.width);
            this.inputBox.outerHeight(rect.height);
            if (this.button.is(":visible")) {
                this.button.hide();
            }
        }
    }
    
    public startEdit(value:any, cell: IJQItem, pos: IPos, showButton = false) {
        this.resetTyping = true;
        this.showButton = showButton;
        if (!this.rootElement) {
            this.create(cell.parent().parent().parent());
        }
        this.position = pos;
        var styles = cell.css(cloneCss);
        this.inputBox.css(styles);        
        this.originalValue = value;
        this.inputBox.val(value);
        this.moveTo(cell);
        if (!this.rootElement.is(":visible")) {
            this.rootElement.show();
            setTimeout(()=>this.moveTo(cell),10);
        }
        this.inputBox.select();
    }

    public setValue(value:any, flagChange = false) {
        if (!this.inputBox) return;
        if (!flagChange) {
            this.originalValue = value;
        }
        this.inputBox.val(value);
        if (this.rootElement.is(":visible")) {
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

    private onButtonClick(event) {
        this.resetTyping = true;
        if (!this.editEvents) return;
        this.editEvents.onEditTyping(event, '', this.position);
    }

    private onEditTyping(event) {
        if (!(this.editEvents && this.onEditTyping)) { return; }
        if (this.resetTyping) { return; }
        var value = this.inputBox.val();
        this.editEvents.onEditTyping(event, value, this.position);        
    }

    public close(cancel=true) {
        if (this.rootElement) {
            this.rootElement.hide();
        }
    }
    
}