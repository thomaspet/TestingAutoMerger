import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from "angular2/core";
import {Control} from "angular2/common";
import {InputTemplateString} from "../inputTemplateString";
import {UniInputBuilder} from "../../forms/builders/uniInputBuilder";
declare var jQuery;

@Component({
    selector: "uni-numeric",
    template: InputTemplateString
})
export class UniNumericInput implements AfterViewInit, OnDestroy {
    @Input()
    config: UniInputBuilder;

    nativeElement;
    numericInput;

    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    refresh(value: any) {
        this.numericInput.value(value);
    }

    ngAfterViewInit() {
        this.config.fieldComponent = this;
        var numericInput;

        var control: Control = this.config.control;
        var options: kendo.ui.NumericTextBoxOptions = this.config.kOptions;

        options.change = function () {
            control.updateValue(this.value(), {});
        };

        numericInput = this.nativeElement.find("input").first().kendoNumericTextBox(options).data("kendoNumericTextBox");
        this.numericInput = numericInput;
        numericInput.value(control.value);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}
