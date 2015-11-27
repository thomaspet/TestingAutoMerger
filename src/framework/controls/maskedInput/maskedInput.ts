import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

export interface MaskedInputConfig {
	control: Control,
	kOptions: kendo.ui.MaskedTextBoxOptions
}

@Directive({
	selector: "[masked]"
})
export class MaskedInput implements AfterViewInit{
	@Input() config: MaskedInputConfig;
	
	constructor(public element: ElementRef) {}

	afterViewInit() {

		var element: any = $(this.element.nativeElement);
		var maskedInput;

		var control = this.config.control;
		var options = this.config.kOptions;

		options.change = function(event) {
			var val = this.value();
			control.updateValue(this.raw());
			this.value(val); // to avoid mask disappearing in input field (due to control storing the raw string)
		}

		maskedInput = element.kendoMaskedTextBox(options).data('kendoMaskedTextBox');

		// init to control value
		if (control.value !== null && control.value.length > 0) {
			maskedInput.value(control.value);
		}
	}
}