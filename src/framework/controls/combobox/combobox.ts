import {Component, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

import {InputTemplateString} from '../inputTemplateString';

export interface ComboboxConfig {
	control: Control;
	kOptions: kendo.ui.ComboBoxOptions;
}


@Component({
	selector: 'uni-combobox',
	template: InputTemplateString
})
export class Combobox implements AfterViewInit {
	@Input() config: ComboboxConfig;
	control;
	constructor(public element: ElementRef) {}

	ngAfterViewInit() {
		var element: any = $(this.element.nativeElement);
		var combobox;
		var control = this.config.control;
		var options = this.config.kOptions;
		var validSelection = false;

		// Set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.ComboBoxSelectEvent) {
			validSelection = true;
		};
		// Store value in control if the selection was valid (input matches an item in the dataSource);
		options.change = function(e) {
			if (validSelection) {
				control.updateValue(this.value());
			} else {
				control.updateValue('');
				this.value('');
			}
		};
		//don't create the kendo component if it exists
		combobox = element.find('input').first().kendoComboBox(options).data('kendoComboBox');

		// Reset validSelection when the input text changes
		Observable.fromEvent(combobox.input, 'keyup').subscribe((event: any) => {
			validSelection = false;	
		});
		combobox.value(control.value);
	}
}