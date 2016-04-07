/// <reference path='../../../../kendo/typescript/kendo.all.d.ts' />
import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';
declare var jQuery;

var templateString = `
    <select
        *ngIf="config.control"
        [ngFormControl]="config.control"
        [disabled]="config.disabled"
        [attr.readonly]="config.readonly"
    ></select>
`;

@Component({
    selector: 'uni-multiselect',
    template: templateString
})
export class UniMultiSelect implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;

    public nativeElement: any;
    public multiselect: kendo.ui.MultiSelect;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.multiselect.focus();
        return this;
    }

    public refresh(value: any): void {
        value = value || [];
        this.multiselect.value(value);
        this.multiselect.trigger('change');
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;
        var multiselect;

        var control: Control = this.config.control;
        var options: kendo.ui.MultiSelectOptions = this.config.kOptions;

        options.highlightFirst = true;
        options.change = function () {
            control.updateValue(this.value(), {});
        };

        multiselect = this.nativeElement
            .find('select')
            .first()
            .kendoMultiSelect(options)
            .data('kendoMultiSelect');

        this.multiselect = multiselect;

        // init to control value
        if (control.value.length > 0) {
            multiselect.value(control.value);
            multiselect.trigger('change');
        }
        this.config.isDomReady.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(templateString);
    }
}
