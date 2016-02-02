/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
declare var jQuery;

export interface MultiSelectConfig {
	control: Control;
	kOptions: kendo.ui.MultiSelectOptions;
}

var templateString = `
    <select
        [ngFormControl]="config.control"
        [disabled]="config.disabled"
        [attr.readonly]="config.readonly"
    ></select>
`;

@Component({
	selector: 'uni-multiselect',
	template: templateString
})
export class MultiSelect implements AfterViewInit, OnDestroy {
	@Input() config: MultiSelectConfig;
	nativeElement;
    
	constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }
	
	ngAfterViewInit() {
		var multiselect;

		var control = this.config.control;
		var options = this.config.kOptions;

		options.highlightFirst = true;
		options.change = function(event: kendo.ui.MultiSelectChangeEvent) {
			control.updateValue(this.value());
		};
        
		multiselect = this.nativeElement.find('select').first().kendoMultiSelect(options).data('kendoMultiSelect');

		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}
    
    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(templateString);
    } 
}