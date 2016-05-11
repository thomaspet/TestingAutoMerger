import {Component, Input, ElementRef} from '@angular/core';
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
    public nativeElement: any;
    
    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.nativeElement
            .find('input')
            .focus();
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
