import {Component, Input} from 'angular2/core';
import {Guid} from '../guid';

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
        <label [attr.for]="guid">{{config.label}}</label>
    `
})
export class UniCheckboxInput {
    @Input() config: any;
    guid: string;

    constructor() { 
        this.guid = Guid.MakeNew().ToString();   
    }

    setFormValue(control,value) {
        control.updateValue(value);
    }
}
