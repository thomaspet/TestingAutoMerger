import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

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
	
	afterViewInit() {
        var numericInput;
		var element: any = $(this.element.nativeElement);

        var control = this.config.control;
        var options = this.config.kOptions;

        //don't create the kendo component if it exists
		if (!element.data('kendoNumericTextBox')) {
            numericInput = element.kendoNumericTextBox(options).data('kendoNumericTextBox');
		} else {
            numericInput = element.data('kendoNumericTextBox');
        }
		
		options.change = function(event) {
			control.updateValue(this.value());	
		};
	}
}