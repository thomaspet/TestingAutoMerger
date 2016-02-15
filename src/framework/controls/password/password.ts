import {Component, Input} from 'angular2/core';

@Component({
    selector: 'uni-password',
    template: `
        <input
            type="password"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniPasswordInput {
    @Input()
    config:any;

    constructor() {
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value) {
        this.config.control.updateValue(value, {});
    }
}
