import {Component} from 'angular2/core';

@Component({
    selector: 'uni-radio-group',
    inputs: ['config'],
    template: `
        <fieldset>
            <legend *ngIf="config.label">{{config.label}}</legend>
            <template ngFor #item [ngForOf]="config.items" #i="index">
                <input
                #rb
                type="radio"
                [value]="item"
                type="radio"
                [ngControl]="config.field"
                [ngClass] = "config.classes"
                [name]="config.field"
                [readonly]="config.readonly"
                [disabled]="config.disabled"
                [class.error]="config.control.touched && !config.control.valid"
                (click)="updateFormValue(config.control,rb.value)"
                />
                <label>{{item[config.textField]}}</label>
            </template>
        </fieldset>
    `
})
export class UniRadioGroup {
    config;

    constructor() {

    }

    updateFormValue(control,value) {
        control.updateValue(value);
    }
}
