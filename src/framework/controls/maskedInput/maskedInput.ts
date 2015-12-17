import {Component, AfterViewInit, ElementRef, Input } from 'angular2/core';
import {Control} from 'angular2/common';

export interface MaskedInputConfig {
	control: Control,
	kOptions: kendo.ui.MaskedTextBoxOptions
}

@Component({
	selector: "uni-masked",
	template: `
		<input
			[ngFormControl]="config.control"
			[ngClass] = "config.classes"
			[readonly]="config.readonly"
			[disabled]="config.disabled"
		/>
	`
})
export class MaskedInput implements AfterViewInit{
	@Input() config: MaskedInputConfig;
	
	constructor(public element: ElementRef) {}

	ngAfterViewInit() {

		var element: any = $(this.element.nativeElement);
		var maskedInput;

		var control = this.config.control;
		var options = this.config.kOptions;

		options.change = function(event) {
			var val = this.value();
			control.updateValue(this.raw());
			this.value(val); // to avoid mask disappearing in input field (due to control storing the raw string)
		}

		maskedInput = element.find('input').first().kendoMaskedTextBox(options).data('kendoMaskedTextBox');

		// init to control value
		if (control.value !== null && control.value.length > 0) {
			maskedInput.value(control.value);
		}
	}
}