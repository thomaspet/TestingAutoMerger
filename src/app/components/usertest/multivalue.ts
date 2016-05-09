import {Component, ElementRef} from "@angular/core";
import {CORE_DIRECTIVES} from "@angular/common";

declare var jQuery;

interface MultiValue {
    id: number,
    value: string,
    editing?: boolean,
    main?: boolean,
    timeout?: any
}

@Component({
    selector: "uni-multival",
    templateUrl: "app/components/usertest/multivalue.html",
    directives: [CORE_DIRECTIVES],
    inputs: ["values", "label"]
})

export class Multival {

    values: MultiValue[];
    activeMultival: boolean;
    trashCan: MultiValue[];
    newValueInd: number;
    element;
    successMessage;

    constructor(private el: ElementRef) {
        var self = this;
        this.element = el.nativeElement;

        // Put a fresh, new bin bag in.
        this.trashCan = [];

        document.addEventListener("click", function (event) {
            var $el = jQuery(el.nativeElement);
            if (!jQuery(event.target).closest($el).length) {
                self.activeMultival = false;
            }
        });
    }

    ngOnInit() {
        // Add an empty placeholder value, if none are passed.
        if (!this.values || !this.values.length) {
            this.values = [{
                id: 0,
                value: ""
            }];
        }
    }

    // What should happen when the user clicks
    // the button next to the input?
    addOrDropdown() {
        if (this.values.length <= 1) {
            this.addValue();
        } else {
            this.activeMultival = !this.activeMultival;
        }
    };

    // Set the "editing" flag to the passed value,
    // and unset it for all others.
    edit(value: MultiValue, event) {
        event.stopPropagation();
        this.values.forEach(function (val: MultiValue) {
            val.editing = val === value;
        });
        return false;
    };

    // Prepares the value for delete.
    // @fixme: Obviously this needs to be rewritten to take server into account.
    // We also want to use the soft delete paradigm for this.
    del(value: MultiValue, event) {
        var values = this.values,
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
    setMain(value: MultiValue) {
        this.values.forEach(function (val: MultiValue) {
            val.main = val === value;
        });
    };

    // Returns the index of the main value, or the first one.
    activeInd() {
        var index: number = 0;

        // If we have a new value, return that index.
        if (this.newValueInd) {
            return this.newValueInd;
        }

        // If not, look for the main index.
        this.values.forEach(function (val: MultiValue, ind: number) {
            if (val.main) {
                index = ind;
                return;
            }
        });
        return index;
    };

    // Add a new, blank value to the array.
    addValue() {
        this.values.push(<MultiValue>{
            id: 0,
            value: ""
        });
        this.newValueInd = this.values.length - 1;
        this.element.querySelectorAll("input")[0].focus();
        this.activeMultival = false;
    };

    // Operations to be performed on enter or blur
    save(value: MultiValue) {
        var hasMain;

        // Stop editing
        value.editing = false;
        this.activeMultival = false;

        // It is no longer new
        this.newValueInd = null;

        // Do we have a main value already?
        this.values.forEach(function (val) {
            if (val.main) {
                hasMain = true;
            }
        });

        // If not, make the first one the main one.
        if (!hasMain) {
            this.values[0].main = true;
        }
    };


}