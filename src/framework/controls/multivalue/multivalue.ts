import {Component, ComponentRef, ElementRef, Input, ViewChild, ViewChildren} from "angular2/core";
import {NgIf, NgFor} from "angular2/common";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
import {UniComponentLoader} from '../../../framework/core/componentLoader';
import {UniModal} from '../../modals/modal';

declare var jQuery;

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
    
    @ViewChildren('editinput') editinputs;

    activeMultival: boolean;
    trashCan = [];
    newValueInd: number;
    element;
    successMessage;
    timeout: any;
    
    index: number = 0;
    editindex: number = null;
    
    constructor(private el: ElementRef) {
        var self = this;
        this.element = el.nativeElement;
        
        // Put a fresh, new bin bag in.
        this.trashCan = [];
        
        document.addEventListener("click", function (event) {
            var $el = jQuery(el.nativeElement);
            if (!jQuery(event.target).closest($el).length) {
                self.activeMultival = false;
                self.editindex = null;
            }
        });    
    }
    
    ngOnInit() {
        this.config.fieldComponent = this;
        //this.config.model[this.config.field].push(this.placeholder());
    }

    // What should happen when the user clicks
    // the button next to the input?
    addOrDropdown() {
        if (this.config.model[this.config.field].length <= 1) {
            this.addValue();
        } else {
            this.activeMultival = !this.activeMultival;
        }
    };

    // Set the "editing" flag to the passed value,
    // and unset it for all others.
    edit(index, event) {
        var self = this;
 
        if (this.config.editor) { // Use custom editor
            this.ucl.load(this.config.editor).then((cmp: ComponentRef)=> {
                cmp.instance.modalConfig.isOpen = true;
                cmp.instance.modalConfig.model = this.config.model[this.config.field][index];
                
                cmp.instance.Changed.subscribe((model: any) => {
                    self.config.model[this.config.field][index] = model;
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

    // Prepares the value for delete.
    // @fixme: Obviously this needs to be rewritten to take server into account.
    // We also want to use the soft delete paradigm for this.
    del(index, row, event) {
        var values = this.config.model[this.config.field],
            self = this;

        event.stopPropagation();
        
        this.timeout = setTimeout(function () {
            values.splice(index, 1);
            self.timeout = null;
        }, 4000);
        
        this.trashCan.push(row);
               
        return false;
    };

    // Undo delete
    putBack(value) {
        clearTimeout(this.timeout);
        this.config.model[this.config.field].concat(this.trashCan);      
        this.trashCan = [];
    };

    // Set the passed value as the main one.
    setAsDefault(index, row) {
        this.index = index;
        this.config.model[this.config.defaultfield] = row[this.config.kOptions.dataValueField];
    };
    
    // Add a new, blank value to the array.
    addValue(event = null) {
        var self = this;
        this.config.model[this.config.field].push(this.placeholder());
        this.editindex = this.config.model[this.config.field].length - 1;
        
        setTimeout(() => {
            self.editinputs.first.nativeElement.focus();            
        });
        
        if (event) { event.stopPropagation(); }
        
        return false;
    };

    // Operations to be performed on enter or blur
    save(row, event) {
        this.editindex = null;
                
        return false;
    };
    
    placeholder() {
        return this.copyObject(this.config.placeholder);
    }
    
    private copyObject<T> (object:T): T {
        var objectCopy = <T>{};

        for (var key in object)
        {
            if (object.hasOwnProperty(key))
            {
                objectCopy[key] = object[key];
            }
        }

        return objectCopy;
    }
}