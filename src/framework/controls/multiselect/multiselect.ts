/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';

export interface MultiSelectConfig {
	control: Control;
	kOptions: kendo.ui.MultiSelectOptions;
}

@Component({
	selector: 'uni-multiselect',
	template: `
		<select
			[ngFormControl]="config.control"
			[ngClass] = "config.classes"
			[disabled]="config.disabled"
		></select>
	`
})
export class MultiSelect implements AfterViewInit {
	@Input() config: MultiSelectConfig;
	
	constructor(public element: ElementRef) { }
	
	ngAfterViewInit() {
		var multiselect;
		var element: any = $(this.element.nativeElement);

		var control = this.config.control;
		var options = this.config.kOptions;

		options.highlightFirst = true;
		options.change = function(event: kendo.ui.MultiSelectChangeEvent) {
			control.updateValue(this.value());
		};
		multiselect = element.find('select').first().kendoMultiSelect(options).data('kendoMultiSelect');

		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}
}