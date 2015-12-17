import {Component, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';
import {InputTemplateString} from "../inputTemplateString";

export interface NumericInputConfig {
	control: Control,
	kOptions: kendo.ui.NumericTextBoxOptions
}

@Component({
	selector: "uni-numeric",
    template: InputTemplateString
})
export class NumericInput {
	@Input() config: NumericInputConfig;
	
	constructor(public element: ElementRef) {}
	
	ngAfterViewInit() {
        var numericInput;
		var element: any = $(this.element.nativeElement);

        var control = this.config.control;
        var options = this.config.kOptions;

        options.change = function(event) {
            control.updateValue(this.value());
        };
        //don't create the kendo component if it exists
		if (element.data('kendoNumericTextBox')) {
            this._destroyKendoWidget(element);
		}
        numericInput = element.find('input').first().kendoNumericTextBox(options).data('kendoNumericTextBox');
	}

    private _destroyKendoWidget(HTMLElement) {
        HTMLElement.data('kendoNumericTextBox').destroy();
        let parent:any = $(HTMLElement[0].parentNode);
        parent.find('span.k-widget.k-numerictextbox').remove();
    }
}