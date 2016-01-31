import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Input} from "angular2/core";



@Component({
    selector: 'uni-multival',
    templateUrl: 'app/components/usertest/multivalue.html',
    directives: [CORE_DIRECTIVES],
    inputs: ['values', 'label']
})

export class Multival {

    private inputVal:string;
    private values:any[];
    private activeMultival:boolean;
    private trashCan: any[];
    private newValueInd: number;

    private addOrDropdown = function(inputVal){

        if(this.values.length <= 1){

            this.addValue();

        }else{
            this.activeMultival = !this.activeMultival;
        }

    };

    private edit = function(value){
        this.values.forEach(function(val){
            if(val !== value){
                val.editing = false;
            }else{
                val.editing = true;
            }
        });
    };

    private del = function(value){
        var values = this.values;

        value.timeout = window.setTimeout(function(){
            if(value.main){
                values[0].main = true;
            }
            var ind = values.indexOf(value);
            values.splice(ind, 1);
        }, 4000);
        this.trashCan.push(value);
    };

    private putBack = function(value){
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

    private setMain = function(value){

        this.values.forEach(function(val){

            if(val !== value){
                val.main = false;
            }else{
                val.main = true;
            }
        });

        this.inputVal = value.value;
    };

    private mainOrFirstValue = function(){

        if(this.values.length){
            this.values.forEach(function(val){
                if(val.main){
                    return val;
                }
            });
            return this.values[0].value
        }
        return '';
    };

    private activeInd = function(){
        var index;

        if(this.newValueInd){
            return this.newValueInd;
        }

        this.values.forEach(function(val, ind){
            if(val.main){
                index = ind;
                return;
            }
        });
        return index || 0;
    };

    private addValue = function(){
        this.values.push({
            id: 0,
            value: ''
        });
        this.newValueInd = this.values.length - 1;
    };

    private save = function(value){
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

    constructor(){
        this.trashCan = [];
    }


    ngOnInit(){

        if(!this.values.length){
            this.values = [{
                id: 0,
                value: ''
            }];
        }

    }

}