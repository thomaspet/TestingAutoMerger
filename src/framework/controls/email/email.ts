import {Component, Input, ElementRef} from 'angular2/core';

declare var jQuery;

@Component({
    selector: 'uni-email',
    template: `
        <input
            *ngIf="config.control"
            type="email"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniEmailInput {
    @Input()
    public config: any;

    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }
    
    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
