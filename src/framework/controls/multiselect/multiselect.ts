/// <reference path="../../../../kendo/typescript/kendo.all.d.ts" />
import {Component, AfterViewInit, ElementRef, Input} from 'angular2/core';
import {Control} from 'angular2/common';

export interface MultiSelectConfig {
	control: Control;
	kOptions: kendo.ui.MultiSelectOptions;
}

var templateString = `
    <select
        [ngFormControl]="config.control"
        [ngClass] = "config.classes"
        [disabled]="config.disabled"
        [attr.readonly]="config.readonly"
    ></select>
`;

@Component({
	selector: 'uni-multiselect',
	template: templateString
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
        this._destroyKendoWidget(element.find('select').first());
        if(!element.find('select').length){
            element.html(templateString);
        }
		multiselect = element.find('select').first().kendoMultiSelect(options).data('kendoMultiSelect');

		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}
    
    private _destroyKendoWidget(HTMLElement) {
        if(HTMLElement.data('kendoMultiSelect')){
            HTMLElement.data('kendoMultiSelect').destroy();
        }
        let parent = HTMLElement.parent();
        parent.html("");
        
    }
}