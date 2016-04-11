import {Component, Input, ElementRef} from 'angular2/core';
import {Guid} from '../guid';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery;

@Component({
    selector: 'uni-checkbox',
    template: `
        <input
            #cb
            [attr.id]="guid"
            type="radio"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
            (change)="setFormValue(cb.checked)"
        />
        <label [attr.for]="guid">{{config.label}}</label>
    `
})
export class UniRadioInput {
    @Input()
    public config: UniFieldBuilder;
    public guid: string;

    constructor(public elementRef:ElementRef) {
        this.guid = Guid.MakeNew().ToString();
    }

    public setFocus() {
        jQuery(this.elementRef).find('input').first().focus();
        return this;
    }

    public refresh(value: any): void {
        this.setFormValue(value);
    }

    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public ngAfterViewInit() {
        this.config.ready.emit(this);
    }

    public setFormValue(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
