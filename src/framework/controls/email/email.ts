import {Component, Input} from 'angular2/core';

@Component({
    selector:'uni-email',
    template: `
        <input
            type="email"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniEmailInput {
    @Input() config: any;
    constructor() {}

}
