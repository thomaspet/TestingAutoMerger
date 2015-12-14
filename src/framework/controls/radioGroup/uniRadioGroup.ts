import {Component} from 'angular2/angular2';

@Component({
    selector: 'uni-radio-group',
    inputs: ['config'],
    template: `
        <fieldset>
            <legend *ng-if="config.label">{{config.label}}</legend>
            <template ng-for #item [ng-for-of]="config.items" #i="index">
                <input
                #rb
                type="radio"
                [value]="item"
                type="radio"
                [ng-control]="config.field"
                [ng-class] = "config.classes"
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
