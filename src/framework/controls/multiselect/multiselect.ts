/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
declare var jQuery;

export interface MultiSelectConfig extends UniFieldBuilder {
    control: Control;
    kOptions: kendo.ui.MultiSelectOptions;
}

var templateString = `
    <select
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
    config:MultiSelectConfig;

    nativeElement;
    multiselect;

    constructor(public elementRef:ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value) {
        this.multiselect.value(value);
        this.multiselect.trigger('change');
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;
        var multiselect;

        var control = this.config.control;
        var options = this.config.kOptions;

        options.highlightFirst = true;
        options.change = function (event:kendo.ui.MultiSelectChangeEvent) {
            control.updateValue(this.value(), {});
        };

        multiselect = this.nativeElement.find('select').first().kendoMultiSelect(options).data('kendoMultiSelect');
        this.multiselect = multiselect;

        // init to control value
        if (control.value.length > 0) {
            multiselect.value(control.value);
            multiselect.trigger('change');
        }
    }

    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(templateString);
    }
}