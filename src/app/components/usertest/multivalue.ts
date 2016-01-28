import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';

@Component({
    selector: 'uni-multival',
    templateUrl: 'app/components/usertest/multivalue.html',
    directives: [CORE_DIRECTIVES],
    inputs: ['values', 'label', 'main']
})

export class Multival {

    private values:string[];
    private main:string;
    private activeMultival:boolean;

    private addOrDropdown = function(inputVal){

        if(this.values.length === 1){

            if(inputVal && this.values.indexOf(inputVal)<0){
                this.values.push(inputVal);
            }

            this.inputVal = '';

        }else if(this.values.length === 0) {

            this.values.push(inputVal);
            this.inputVal = '';

        }else{
            this.activeMultival = !this.activeMultival;
        }

    };

    private setMain = function(value: string){
        this.main = value;
    };


}