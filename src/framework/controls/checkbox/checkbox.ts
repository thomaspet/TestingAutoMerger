import {Component, Input} from "angular2/core";
import {Control} from "angular2/common";
import {Guid} from "../guid";
import {UniInputBuilder} from "../../forms/builders/uniInputBuilder";

@Component({
    selector: "uni-checkbox",
    template: `
        <input
            #cb
            [attr.id]="guid"
            type="checkbox"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
            (change)="setFormValue(config.control, cb.checked)"
        />
        <label [attr.for]="guid">{{config.description}}</label>
    `
})
export class UniCheckboxInput {
    @Input()
    config: UniInputBuilder;

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
