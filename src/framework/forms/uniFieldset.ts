import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';

@Component({
    selector: 'uni-fieldset',
    inputs: ['config'],
    directives: [UniComponentLoader],
    template: `<fieldset>
        <legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-component-loader
                [type]="field.fieldType"
                [config]="field">
            </uni-component-loader>
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