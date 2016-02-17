import {Component,Input} from 'angular2/core';
import {UniCardFormBuilder} from './builders/uniCardFormBuilder';
import {UniForm} from './uniForm';

@Component({
    selector: 'card-form',
//    directives: [UniForm],
    template: `
         <div *ngIf="config" *ngFor="#form of config.forms #index = index">
             <p> heisann </p>
             <uni-form (uniFormSubmit)="onSubmit($event, index)" [config]='config'></uni-form>
         </div>
    `
})


export class CardForm {
    
    @Input()
    config: UniCardFormBuilder;
    
    constructor() {
        //console.log("config: " + this.config.forms);
    }
    
    onSubmit(event, index) {
        console.log(event);
    }
}