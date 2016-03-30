import {Component, Input, ElementRef} from 'angular2/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery;

@Component({
    selector: 'uni-text',
    template: `
        <input
            *ngIf="config.control"
            type="text"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
    `
})
export class UniTextInput {
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
        this.config.isDomReady.emit(true);
    }

    public refresh(value: any) {
        this.config.control.updateValue(value, {});
    }
}
