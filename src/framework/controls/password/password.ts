import {Component, Input} from 'angular2/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

@Component({
    selector: 'uni-password',
    template: `
        <input
            *ngIf="config.control"
            type="password"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniPasswordInput {
    @Input()
    public config: UniFieldBuilder;

    constructor() {
    }

    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public refresh(value: any) {
        this.config.control.updateValue(value, {});
    }
}
