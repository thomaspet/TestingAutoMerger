import {Component, Input} from 'angular2/core';

@Component({
    selector:'uni-checkbox',
    template: `
        <input
            #cb
            type="checkbox"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
            (change)="setFormValue(config.control, cb.checked)"
        />
    `
})
export class UniCheckboxInput {
    @Input() config: any;

    constructor() { }

    setFormValue(control,value) {
        control.updateValue(value);
    }
}
