import {Component, Input} from "angular2/core";
import {Control} from "angular2/common";
import {Guid} from "../guid";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

@Component({
    selector: "uni-checkbox",
    template: `
        <input
            #cb
            [attr.id]="guid"
            type="radio"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
            (change)="setFormValue(config.control, cb.checked)"
        />
        <label [attr.for]="guid">{{config.label}}</label>
    `
})
export class UniRadioInput {
    @Input()
    config: UniFieldBuilder;

    guid: string;

    constructor() {
        this.guid = Guid.MakeNew().ToString();
    }

    refresh(value: any): void {
        this.setFormValue(this.config.control, value);
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    setFormValue(control: Control, value: any): void {
        control.updateValue(value, {});
    }
}
