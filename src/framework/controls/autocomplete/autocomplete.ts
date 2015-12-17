import {Component, AfterViewInit,ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

import {InputTemplateString} from '../inputTemplateString';

export interface AutocompleteConfig {
	control: Control;
	kOptions: kendo.ui.AutoCompleteOptions;
}

@Component({
	selector:'uni-autocomplete',
	template: InputTemplateString
})
export class Autocomplete implements AfterViewInit {
	@Input() config: AutocompleteConfig;
	
	constructor(public element:ElementRef) { }
	
	ngAfterViewInit() {
		var element: any = $(this.element.nativeElement);
		var control = this.config.control;
		var options: kendo.ui.AutoCompleteOptions = this.config.kOptions;
		
		options.highlightFirst = true; // This setting is important! Forcing only valid inputs wont work without it.
		var validSelection = false;
		
		// Reset validSelection when input changes
		Observable.fromEvent(element, 'keyup').subscribe((event) => {
			validSelection = false;
		});
		
		// Update control value and set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.AutoCompleteSelectEvent) {
			var item: any = event.item;
			var dataItem = this.dataItem(item.index());
			control.updateValue(dataItem.toJSON());
			validSelection = true;
		};
		
		// Reset the fields on change events (blur, enter, ...) if input was invalid
		options.change = function(event: kendo.ui.AutoCompleteChangeEvent) {
			if (!validSelection) {
				this.value('');
				control.updateValue(undefined);
			}
		};

		var autocomplete = element.find('input').first().kendoAutoComplete(options).data('kendoAutoComplete');
		autocomplete.value(control.value[this.config.kOptions.dataTextField]);
	}
}