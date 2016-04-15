import {Component, ComponentRef, ElementRef, Input, ViewChild, ViewChildren} from "angular2/core";
import {NgIf, NgFor} from "angular2/common";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
import {UniComponentLoader} from '../../../framework/core/componentLoader';

declare var jQuery;
declare var _;

@Component({
    selector: "uni-multivalue",
    templateUrl: "framework/controls/multivalue/multivalue.html",
    directives: [NgIf, NgFor, UniComponentLoader],
    inputs: ["values", "label"]
})

export class UniMultiValue {
    @Input()
    config: UniFieldBuilder;

    @ViewChild(UniComponentLoader)
    ucl: UniComponentLoader;
    modalinstance: Promise<any>;
    
    @ViewChildren('editinput') editinputs;

    activeMultival: boolean;
    element;
    successMessage;
    
    index: number = 0;
    editindex: number = null;
    delindexes = [];
    timers = [];
    
    constructor(private el: ElementRef) {
        var self = this;
        this.element = el.nativeElement;
                              
        document.addEventListener("click", function (event) {
            var $el = jQuery(el.nativeElement);
            if (!jQuery(event.target).closest($el).length) {
                self.activeMultival = false;
                self.editindex = null;
            }
        });    
   }
    
    ngOnInit() {
        var list = this.config.model[this.config.field];
        if (list.length < 1) {
            this.config.model[this.config.field].push(this.placeholder());
        }
              
        this.config.fieldComponent = this;
    }
    
    //ngAfterViewInit() {
    //          if (this.config.model[this.config.field].length == 0) {
    //        this.config.model[this.config.field].push(this.placeholder());
    //    }
 
//    }
        
    refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
    
    // What should happen when the user clicks
    // the button next to the input?
    addOrDropdown() {  
        if (this.config.model[this.config.field].length <= 1) {
            this.addValue();
        } else {
            this.activeMultival = !this.activeMultival;
        }
        
        return false;
    };

    editIfEditor(event) {
        if (this.config.editor) {
            this.edit(0, event);
            return false;        
        } 
        
        return true;
    }

    // Set the "editing" flag to the passed value
    // and unset it for all others.
    edit(index, event) {
        var self = this;
 
        if (this.config.editor) { // Use custom editor
            this.ucl.load(this.config.editor).then((cmp: ComponentRef)=> {
                cmp.instance.modalConfig.isOpen = true;
                cmp.instance.modalConfig.model = this.config.model[this.config.field][index];
                        
                cmp.instance.Changed.subscribe((model: any) => {
                    self.config.model[this.config.field][index] = model;
                    self.editindex = null;
                    self.activeMultival = false;
                    if (self.config.onChange) {
                        self.config.onChange(model);   
                    }
                });    
            });                       
        } else {
            this.editindex = index;
    
            setTimeout(() => {
               self.editinputs.first.nativeElement.focus();            
            });    
        }
                
        event.stopPropagation();
  
        return false;
    };

    indelete(index) {
        var delidx = this.delindexes.indexOf(index);
        return delidx > -1;
    }
    
    remdelete(index, cleartimer) {
         var delidx = this.delindexes.indexOf(index);
         if (delidx > -1) {
            this.delindexes.splice(delidx, 1);
            if (cleartimer) clearTimeout(this.timers[delidx]);
            this.timers.splice(delidx, 1);
         }    
    }

    // Prepares the value for delete.
    del(row, index, event) {
        var self = this;
        
        this.delindexes.push(index);
        this.timers.push(setTimeout(function (r, i) {
            if (self.indelete(i)) {
                row.Deleted = true;
            }      
            self.remdelete(i, false);
        }, 4000, row, index));
    
        event.stopPropagation();

        return false;
    };

    // Undo delete
    putBack(row, index, event) {
        this.remdelete(index, true);
        event.stopPropagation();
        
        return false;
    };

    // Set the passed value as the main one.
    setAsDefault(row, index) {
        this.index = index;
        this.config.model[this.config.defaultfield] = row[this.config.kOptions.dataValueField];
        this.activeMultival = false;  
        if (this.config.onSelect) {
           this.config.onSelect(row);             
        } 
    };
    
    // Add a new, blank value to the array.
    addValue(event = null) {
        var self = this;
        this.config.model[this.config.field].push(this.placeholder());
        var index = this.config.model[this.config.field].length - 1;
        
        if (this.config.editor) { // Use custom editor
            this.ucl.load(this.config.editor).then((cmp: ComponentRef)=> {
                cmp.instance.modalConfig.isOpen = true;
                cmp.instance.modalConfig.model = self.config.model[self.config.field][index];
                
                cmp.instance.Changed.subscribe((model: any) => {
                    self.config.model[self.config.field][index] = model;
                    self.editindex = null;
                });                
            });                        
        } else {
            this.editindex = this.config.model[this.config.field].length - 1;
            
            setTimeout(() => {
                self.editinputs.first.nativeElement.focus();            
            });            
        }
        
        if (event) { event.stopPropagation(); }
        
        return false;
    };

    // Operations to be performed on enter or blur
    save(row, event) {
        this.editindex = null;
                
        return false;
    };
    
    placeholder() {
        return _.cloneDeep(this.config.placeholder);
    }
}