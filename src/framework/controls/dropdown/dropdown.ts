import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';

import {InputTemplateString} from '../inputTemplateString';
declare var jQuery;

export interface DropdownConfig {
	control: Control;
	kOptions: kendo.ui.DropDownListOptions;
}

@Component({
	selector: 'uni-dropdown',
	template: InputTemplateString
})
export class Dropdown implements AfterViewInit, OnDestroy {
	@Input() config: DropdownConfig;
    nativeElement;
	
	constructor(public elementRef: ElementRef) { 
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }
	
	ngAfterViewInit() {
		var vm = this;
		var dropdown;

		this.config.kOptions.change = function(event) {
			vm.config.control.updateValue(this.value());
		}

		dropdown = this.nativeElement.find('input').first().kendoDropDownList(this.config.kOptions).data('kendoDropDownList');
		dropdown.value(vm.config.control.value); // init to control
	}
    
    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    } 
}
