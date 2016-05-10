import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from '@angular/core';
import {Control} from '@angular/common';
import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery, _;

@Component({
    selector: 'uni-masked',
    template: InputTemplateString
})
export class UniMaskedInput implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;
    public nativeElement: any;
    public maskedInput: kendo.ui.MaskedTextBox;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.nativeElement
            .find('input')
            .first()
            .focus();
        return this;
    }

    public refresh(value) {
        value = value || '';
        this.maskedInput.value(value);
        this.config.control.updateValue(value, {});
    }

    public ngAfterViewInit() {
        this.config.fieldComponent = this;
        var maskedInput;

        var control: Control = this.config.control;
        var options: kendo.ui.MaskedTextBoxOptions = this.config.kOptions;

        options.change = function () {
            var val = this.value();
            control.updateValue(this.raw(), {});
            // to avoid mask disappearing in input field (due to control storing the raw string)
            this.value(val);
        };

        maskedInput = this.nativeElement
            .find('input')
            .first()
            .kendoMaskedTextBox(options)
            .data('kendoMaskedTextBox');

        this.maskedInput = maskedInput;

        // init to control value
        if (!_.isNil(control.value) && control.value.length > 0) {
            maskedInput.value(control.value);
        }
        this.config.ready.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
