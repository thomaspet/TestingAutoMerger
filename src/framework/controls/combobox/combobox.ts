import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

import {InputTemplateString} from '../inputTemplateString';

declare var jQuery; // $ is reserved for angular ElementFinder

export interface ComboboxConfig {
	control?: Control;
	onSelect?: Function;
	kOptions: kendo.ui.ComboBoxOptions;
}

@Component({
	selector: 'uni-combobox',
	template: InputTemplateString
})
export class Combobox implements AfterViewInit, OnDestroy {
	@Input() config: ComboboxConfig;
	control;
    nativeElement: any;
	
	constructor(private elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

	ngAfterViewInit() {
        var control = this.config.control;
		var options = this.config.kOptions;
		var validSelection = false;

		// Set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.ComboBoxSelectEvent) {
			validSelection = true;
		};
		
        // Store value in control if the selection was valid (input matches an item in the dataSource);
		var self = this;
		options.change = function(e) {
			var newValue = (validSelection) ? this.value() : '';
			
			if (control) {
				control.updateValue(newValue);
			}
			
			if (self.config.onSelect) {
				self.config.onSelect(newValue);
			}
			
		};
		
		var combobox = this.nativeElement.find('input').first().kendoComboBox(options).data('kendoComboBox');
		
        // Reset validSelection when the input text changes
		Observable.fromEvent(combobox.input, 'keyup').subscribe((event: any) => {
			validSelection = false;	
		});
		
		if (control) combobox.value(control.value);
	}
    
    
    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }    
}