import {Component, Input} from 'angular2/core';

@Component({
    selector:'uni-email',
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
    @Input() config: any;
    constructor() {}
}
