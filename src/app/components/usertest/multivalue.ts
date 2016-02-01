import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Input} from "angular2/core";

interface MultiValue {
    id: number,
    value: string,
    editing?: boolean,
    main?: boolean,
    timeout?: any
}

@Component({
    selector: 'uni-multival',
    templateUrl: 'app/components/usertest/multivalue.html',
    directives: [CORE_DIRECTIVES],
    inputs: ['values', 'label']
})

export class Multival {

    inputVal:string;
    values: MultiValue[];
    activeMultival:boolean;
    trashCan: MultiValue[];
    newValueInd: number;

    constructor(){
        this.trashCan = [];
    }

    ngOnInit(){
        // Add an empty placeholder value, if none are passed.
        if(!this.values || !this.values.length){
            this.values = [{
                id: 0,
                value: ''
            }];
        }
    }

    // What should happen when the user clicks
    // the button next to the input?
    addOrDropdown(){
        if(this.values.length <= 1){
            this.addValue();
        }else{
            this.activeMultival = !this.activeMultival;
        }
    };

    // Set the "editing" flag to the passed value,
    // and unset it for all others.
    edit(value: MultiValue){
        this.values.forEach(function(val: MultiValue){
            val.editing = val === value;
        });
    };

    // Prepps the value for delete.
    // @fixme: Obviosly this needs to be rewritten to take server into account.
    // We also want to use the softdelete pargdigme for this.
    del(value: MultiValue){
        var values = this.values,
            self = this;

        value.timeout = window.setTimeout(function(){
            if(value.main){
                values[0].main = true;
            }
            var ind = values.indexOf(value);
            values.splice(ind, 1);
            if(!values.length){
                self.activeMultival = false;
                values.push(<MultiValue>{
                    id: 0,
                    value: ''
                });
            }
        }, 4000);
        this.trashCan.push(value);
    };

    // Undo delete
    putBack(value: MultiValue){
        var trashCan = this.trashCan;
        trashCan.forEach(function(trash, ind){
            if(trash.id == value.id && value.value === trash.value){
                clearTimeout(value.timeout);
                value.timeout = null;
                value.editing = false;
                trashCan.splice(ind, 1);
                return;
            }
        });
    };

    // Set the value as the main one.
    setMain(value: MultiValue){
        this.values.forEach(function(val: MultiValue){
            val.main = val === value;
        });
        this.inputVal = value.value;
    };

    mainOrFirstValue(){
        if(this.values.length){
            this.values.forEach(function(val: MultiValue){
                if(val.main){
                    return val;
                }
            });
            return this.values[0].value
        }
        return '';
    };

    activeInd(){
        var index: number = 0;

        if(this.newValueInd){
            return this.newValueInd;
        }

        this.values.forEach(function(val: MultiValue, ind: number){
            if(val.main){
                index = ind;
                return ind;
            }
        });
        return index;
    };

    addValue(){
        this.values.push(<MultiValue>{
            id: 0,
            value: ''
        });
        this.newValueInd = this.values.length - 1;
    };

    save(value: MultiValue){
        var hasMain;

        value.editing = false;
        this.newValueInd = null;
        this.values.forEach(function(val){
            if(val.main){
                hasMain = true;
            }
        });

        if(!hasMain){
            this.values[0].main = true;
        }
    };


}