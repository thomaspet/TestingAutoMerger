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
		var control = this.config.control;
		var options = this.config.kOptions;
		
		options.change = function(event) {
			control.updateValue(this.value());	
		};
		
		var element: any = $(this.element.nativeElement);
		var numericInput = element.kendoNumericTextBox(options).data('kendoNumericTextBox');
		
		// init to control value
	}
}