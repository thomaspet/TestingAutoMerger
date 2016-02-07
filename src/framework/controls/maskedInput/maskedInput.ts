import {Component, ElementRef, Input, AfterViewInit, OnDestroy } from 'angular2/core';
import {Control} from 'angular2/common';
import {InputTemplateString} from '../inputTemplateString';

declare var jQuery;

export interface MaskedInputConfig {
	control: Control,
	kOptions: kendo.ui.MaskedTextBoxOptions
}

@Component({
	selector: "uni-masked",
	template: InputTemplateString
})
export class UniMaskedInput implements AfterViewInit, OnDestroy {
	@Input() config: MaskedInputConfig;
	nativeElement;
    
	constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

	ngAfterViewInit() {
		var maskedInput;

		var control = this.config.control;
		var options = this.config.kOptions;

		options.change = function(event) {
			var val = this.value();
			control.updateValue(this.raw());
			this.value(val); // to avoid mask disappearing in input field (due to control storing the raw string)
		}

		maskedInput = this.nativeElement.find('input').first().kendoMaskedTextBox(options).data('kendoMaskedTextBox');

		// init to control value
		if (control.value !== null && control.value.length > 0) {
			maskedInput.value(control.value);
		}
	}
    
    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    } 
}