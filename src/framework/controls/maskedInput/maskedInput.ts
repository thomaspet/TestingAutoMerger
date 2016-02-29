import {Component, ElementRef, Input, AfterViewInit, OnDestroy } from "angular2/core";
import {Control} from "angular2/common";
import {InputTemplateString} from "../inputTemplateString";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

declare var jQuery,_;

@Component({
    selector: "uni-masked",
    template: InputTemplateString
})
export class UniMaskedInput implements AfterViewInit, OnDestroy {
    @Input()
    config: UniFieldBuilder;

    nativeElement;
    maskedInput;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value) {
        this.maskedInput.value(value);
        this.config.control.updateValue(value,{});
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;
        var maskedInput;

        var control: Control = this.config.control;
        var options: kendo.ui.MaskedTextBoxOptions = this.config.kOptions;

        options.change = function () {
            var val = this.value();
            control.updateValue(this.raw(), {});
            this.value(val); // to avoid mask disappearing in input field (due to control storing the raw string)
        };

        maskedInput = this.nativeElement.find("input").first().kendoMaskedTextBox(options).data("kendoMaskedTextBox");
        this.maskedInput = maskedInput;

        // init to control value
        if (!_.isNil(control.value) && control.value.length > 0) {
            maskedInput.value(control.value);
        }
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}