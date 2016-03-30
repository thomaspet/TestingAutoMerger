import {Component, ComponentRef, ElementRef, Input, ViewChild, ViewChildren} from "angular2/core";
import {NgIf, NgFor} from "angular2/common";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
import {UniComponentLoader} from '../../../framework/core/componentLoader';
<<<<<<< HEAD
=======
import {UniModal} from '../../modals/modal';
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4

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
<<<<<<< HEAD
    modalinstance: Promise<any>;
=======
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
    
    @ViewChildren('editinput') editinputs;

    activeMultival: boolean;
<<<<<<< HEAD
=======
    trashCan = [];
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
    newValueInd: number;
    element;
    successMessage;
    timeout: any;
    
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
        this.config.fieldComponent = this;
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
    edit(row, index, event) {
        var self = this;
<<<<<<< HEAD
        this.editindex = index;

        if (this.config.editor) {
            this.ucl.load(this.config.editor).then((cmp: ComponentRef)=> {
                console.log("==EDITOR ADDED==");   
                //cmp.instance.modal.open();        
            });                        
        }
       
     //   setTimeout(() => {
     //       self.editinputs.first.nativeElement.focus();            
     //   });
        
=======
 
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
                
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
        event.stopPropagation();
  
        return false;
    };

<<<<<<< HEAD
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
=======
    // Prepares the value for delete.
    // @fixme: Obviously this needs to be rewritten to take server into account.
    // We also want to use the soft delete paradigm for this.
    del(index, row, event) {
        var values = this.config.model[this.config.field],
            self = this;
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4

    // Prepares the value for delete.
    del(row, index, event) {
        var self = this;
        
        this.delindexes.push(index);
        this.timers.push(setTimeout(function (r, i) {
            console.log("ENDING TIMER");        
            if (self.indelete(i)) {
                console.log("DELETED NOW");
                row.Deleted = true;
            }      
            self.remdelete(i, false);
        }, 10000, row, index));
    
        event.stopPropagation();
<<<<<<< HEAD
 
=======
        
        this.timeout = setTimeout(function () {
            values.splice(index, 1);
            self.timeout = null;
        }, 4000);
        
        this.trashCan.push(row);
               
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
        return false;
    };

    // Undo delete
<<<<<<< HEAD
    putBack(row, index, event) {
        this.remdelete(index, true);
        event.stopPropagation();
        
        return false;
=======
    putBack(value) {
        clearTimeout(this.timeout);
        this.config.model[this.config.field].concat(this.trashCan);      
        this.trashCan = [];
>>>>>>> 4eb61a5d4f9d98b70ab758c9bb6a8134686cf0e4
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