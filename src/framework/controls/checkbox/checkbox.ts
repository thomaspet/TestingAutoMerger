import {Component, Input} from 'angular2/core';
import {Guid} from '../guid';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

@Component({
    selector: 'uni-checkbox',
    template: `
        <input
            *ngIf="config.control"
            #cb
            [attr.id]="guid"
            type="checkbox"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
            (change)="setFormValue(cb.checked)"
        />
        <label [attr.for]="guid">{{config.label}}</label>
    `
})
export class UniCheckboxInput {
    @Input()
    public config: UniFieldBuilder;

    public guid: string;

    constructor() {
        this.guid = Guid.MakeNew().ToString();
    }

    public refresh(value: any): void {
        this.setFormValue(value);
    }

    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public setFormValue(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
