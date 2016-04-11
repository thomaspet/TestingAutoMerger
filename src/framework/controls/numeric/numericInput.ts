import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';
declare var jQuery;

@Component({
    selector: 'uni-numeric',
    template: InputTemplateString
})
export class UniNumericInput implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;

    public nativeElement: any;
    public numericInput: kendo.ui.NumericTextBox;
    
    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.numericInput.focus();
        return this;
    }

    public refresh(value: any) {
        value = value || 0;
        this.numericInput.value(value);
        this.numericInput.trigger('change');
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;
        var numericInput;

        var control: Control = this.config.control;
        var options: kendo.ui.NumericTextBoxOptions = this.config.kOptions;

        options.change = function () {
            control.updateValue(this.value(), {});
        };

        numericInput = this.nativeElement.find('input').first().kendoNumericTextBox(options).data('kendoNumericTextBox');
        this.numericInput = numericInput;
        numericInput.value(control.value);
        this.config.ready.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
