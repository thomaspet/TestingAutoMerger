/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

export interface MultiSelectConfig {
	control: Control;
	kOptions: kendo.ui.MultiSelectOptions;
}

@Directive({
	selector: '[multiselect]'
})
export class MultiSelect implements AfterViewInit {
	@Input() config: MultiSelectConfig;
	
	constructor(public element: ElementRef) { }
	
	afterViewInit() {
		var multiselect;
		var element: any = $(this.element.nativeElement);

		var control = this.config.control;
		var options = this.config.kOptions;

		//don't create the kendo component if it exists
		if (!element.data('kendoMultiSelect')) {
			multiselect = element.kendoMultiSelect(options).data('kendoMultiSelect');
		} else {
			multiselect = element.data('kendoMultiSelect');
		}
	
		options.highlightFirst = true;		
		options.change = function(event: kendo.ui.MultiSelectChangeEvent) {
			control.updateValue(this.value());
		}

		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}
}