import {Component, Input} from '@angular/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

@Component({
    selector: 'uni-radio-group',
    template: `
        <fieldset *ngIf="config.control">
            <legend *ngIf="config.label">{{config.label}}</legend>
            <template ngFor #item [ngForOf]="config.items" #i="index">
                <input
                #rb
                type="radio"
                [value]="item"
                [ngControl]="config.field"
                [name]="config.field"
                [readonly]="config.readonly"
                [disabled]="config.disabled"
                [class.error]="config.control.touched && !config.control.valid"
                (click)="updateFormValue(rb.value)"
                />
                <label>{{item[config.textField]}}</label>
            </template>
        </fieldset>
    `
})
export class UniRadioGroup {
    @Input()
    public config: UniFieldBuilder;
    constructor() {
    }

    public setFocus() {
        return this;
    }


    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public ngAfterViewInit() {
        this.config.ready.emit(this);
    }

    public refresh(value: any) {
        this.updateFormValue(value);
    }

    public updateFormValue(value: any) {
        this.config.control.updateValue(value, {});
    }
}
