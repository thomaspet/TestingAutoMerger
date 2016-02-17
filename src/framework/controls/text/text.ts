import {Component, Input} from "angular2/core";
import {UniInputBuilder} from "../../forms/builders/uniInputBuilder";

@Component({
    selector: "uni-text",
    template: `
        <input
            type="text"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniTextInput {
    @Input()
    config: UniInputBuilder;

    constructor() {
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value: any) {
        this.config.control.updateValue(value, {});
    }
}
