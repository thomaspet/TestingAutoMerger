import {Component, Input} from "angular2/core";
import {UniInput} from "./uniInput";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";

@Component({
    selector: 'uni-combo-input',
    directives: [UniInput],
    template: `<legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-field [config]="field" [ngClass]="field.classes" [class.error]="hasError(field)"></uni-field>
        </template>`,
})
export class UniComboInput {
    @Input()
    config;

    constructor() {
    }

    hasError(field: UniFieldBuilder) {
        return field.control.touched && !field.control.valid;
    }
}