import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';

@Component({
    selector: 'uni-multival',
    template: `
        <label class="uni-multivalue -has-values">{{label}}

            <input type="text" [(ngModel)]="mainValue || values[0]">
            <button class="uni-multivalue-moreBtn" (click)="activeMultival = !activeMultival">Add</button>

            <ul class="uni-multivalue-values" [class.-is-active]="activeMultival">
                <li *ngFor="#value of values" [class.-is-main]="value === mainValue">
                    {{value}}
                    <button class="setMainBtn" (click)="setMain(value)">Set {{value}} as main</button>
                </li>
            </ul>

            <button>+ Legg til</button>

        </label>
    `,
    directives: [CORE_DIRECTIVES],
    inputs: ['values', 'label']
})

export class Multival {

    private values:string[];
    private mainValue:string;

    private setMain = function(value: string){
        this.mainValue = value;
    };
    private addValue = function(value: string){
        this.values.push(value);
    };
    private modify = function(value, currentlyMain){
        if(currentlyMain){

        }
    };

    constructor(){

    }

}