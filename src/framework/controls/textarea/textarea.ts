import {Component, Input, ElementRef} from '@angular/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery;

@Component({
    selector: 'uni-text-area',
    template: `
        <textarea *ngIf="config.control"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        ></textarea>
    `
})
export class UniTextAreaInput {
    @Input()
    public config: UniFieldBuilder;
    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }


    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public ngAfterViewInit() {
        this.config.ready.emit(this);
    }

    public refresh(value: any) {
        this.config.control.updateValue(value, {});
    }
}
