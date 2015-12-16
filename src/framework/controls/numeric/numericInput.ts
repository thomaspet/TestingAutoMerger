import {Directive, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';

export interface NumericInputConfig {
	control: Control,
	kOptions: kendo.ui.NumericTextBoxOptions
}

@Directive({
	selector: "[numeric]"
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
        numericInput = element.kendoNumericTextBox(options).data('kendoNumericTextBox');
	}

    private _destroyKendoWidget(HTMLElement) {
        HTMLElement.data('kendoNumericTextBox').destroy();
        let parent:any = $(HTMLElement[0].parentNode);
        parent.find('span.k-widget.k-numerictextbox').remove();
    }
}