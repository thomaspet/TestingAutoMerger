import {Component} from 'angular2/core';
import {UniField} from './uniField';

@Component({
    selector: 'uni-fieldset',
    inputs: ['config'],
    directives: [UniField],
    template: `<fieldset>
        <legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-field [config]="field" [ngClass]="field.classes" [class.error]="hasError(field)"></uni-field>
        </template>
    </fieldset>`,
})
export class UniFieldset {
    config;

    constructor() {
    }
    hasError(field) {
        return field.control.touched && !field.control.valid;
    }
}