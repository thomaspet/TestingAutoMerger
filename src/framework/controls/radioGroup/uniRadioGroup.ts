import {Component, Input} from "angular2/core";
import {InputTemplateString} from "../inputTemplateString";
import {Control} from "angular2/common";
import {UniInputBuilder} from "../../forms/builders/uniInputBuilder";

@Component({
    selector: "uni-radio-group",
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
    @Input()
    config: UniInputBuilder;

    constructor() {

    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value: any) {
        this.updateFormValue(this.config.control, value);
    }

    updateFormValue(control: Control, value: any) {
        control.updateValue(value, {});
    }
}
