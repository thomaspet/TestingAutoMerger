import {Component, Input} from "angular2/core";
import {UniField} from "./uniField";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";

@Component({
    selector: 'uni-combo-field',
    directives: [UniField],
    template: `<legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-field [config]="field" [ngClass]="field.classes" [class.error]="hasError(field)"></uni-field>
        </template>`,
})
export class UniComboField {
    @Input()
    config;

    constructor() {
    }

    hasError(field: UniFieldBuilder) {
        return field.control.touched && !field.control.valid;
    }
}