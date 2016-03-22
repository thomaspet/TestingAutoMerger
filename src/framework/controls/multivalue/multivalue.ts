import {Component, ComponentRef, ElementRef, Input, ViewChild, ViewChildren} from "angular2/core";
import {NgIf, NgFor} from "angular2/common";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
import {UniComponentLoader} from '../../../framework/core/componentLoader';
import {UniModal} from '../../modals/modal';

declare var jQuery;

interface MultiValue {
    id: number,
    value: string,
    editing?: boolean,
    main?: boolean,
    timeout?: any
}

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
    trashCan: MultiValue[];
    newValueInd: number;
    element;
    successMessage;
    
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
    del(value: MultiValue, event) {
        var values = this.config.model,
            self = this;

        event.stopPropagation();
        value.timeout = window.setTimeout(function () {
            if (value.main) {
                values[0].main = true;
            }
            var ind = values.indexOf(value);
            values.splice(ind, 1);
            if (!values.length) {
                self.activeMultival = false;
                values.push(<MultiValue>{
                    id: 0,
                    value: ""
                });
            }
        }, 4000);
        this.trashCan.push(value);
        return false;
    };

    // Undo delete
    putBack(value: MultiValue) {
        var trashCan = this.trashCan;
        trashCan.forEach(function (trash, ind) {
            if (trash.id == value.id && value.value === trash.value) {
                clearTimeout(value.timeout);
                value.timeout = null;
                value.editing = false;
                trashCan.splice(ind, 1);
                return;
            }
        });
    };

    // Set the passed value as the main one.
    setAsDefault(row, index) {
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