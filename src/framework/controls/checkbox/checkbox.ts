import {Component, Input} from 'angular2/core';
import {Guid} from '../guid';
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

@Component({
    selector:'uni-checkbox',
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
    config: UniFieldBuilder;

    guid: string;

    constructor() { 
        this.guid = Guid.MakeNew().ToString();   
    }

    refresh(value) {
        this.setFormValue(this.config.control, value);
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    setFormValue(control,value) {
        control.updateValue(value);
    }
}
