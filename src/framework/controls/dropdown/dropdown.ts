import {Component, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';

import {InputTemplateString} from '../inputTemplateString';

export interface DropdownConfig {
	control: Control;
	kOptions: kendo.ui.DropDownListOptions;
}

@Component({
	selector: 'uni-dropdown',
	template: InputTemplateString
})
export class Dropdown implements AfterViewInit {
	@Input() config: DropdownConfig;
	
	constructor(public element: ElementRef) { }
	
	ngAfterViewInit() {
		var vm = this;
		var element: any = $(this.element.nativeElement);
		var dropdown;

		this.config.kOptions.change = function(event) {
			vm.config.control.updateValue(this.value());
		}

		//don't create the kendo component if it exists
		dropdown = element.find('input').first().kendoDropDownList(this.config.kOptions).data('kendoDropDownList');

		dropdown.value(vm.config.control.value); // init to control
	}
}
