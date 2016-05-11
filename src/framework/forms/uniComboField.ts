import {Component, Input} from "@angular/core";
import {UniField} from "./uniField";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";
import {UniGenericField} from "./shared/UniGenericField";

@Component({
    selector: 'uni-combo-field',
    directives: [UniField],
    template: `<legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor let-field [ngForOf]="config.fields" let i="index">
            <uni-field [config]="field" [ngClass]="field.classes" [class.error]="hasError(field)"></uni-field>
        </template>`,
})
export class UniComboField extends UniGenericField{
    @Input()
    config;

    constructor() {
        super();
    }

    hasError(field: UniFieldBuilder) {
        return field.control.touched && !field.control.valid;
    }
}