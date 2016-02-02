import {Component} from 'angular2/core';
import {UniField} from './uniField';

@Component({
    selector: 'uni-combo',
    inputs: ['config'],
    directives: [UniField],
    template: `<legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-field [config]="field" [ngClass]="field.classes" [class.error]="hasError(field)"></uni-field>
        </template>`,
})
export class UniCombo {
    config;

    constructor() {
    }
    hasError(field) {
        return field.control.touched && !field.control.valid;
    }
}