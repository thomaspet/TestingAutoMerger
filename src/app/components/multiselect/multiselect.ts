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
		var control = this.config.control;
		var options = this.config.kOptions;
		
		options.change = function(event: kendo.ui.MultiSelectEvent) {
			var dataItems = event.sender.dataItems();
			var values = [];
			
			dataItems.forEach((dataItem) => {
				values.push(dataItem[options.dataValueField]);
			})
			
			control.updateValue(values);			
		}
		
		var element: any = $(this.element.nativeElement);
		var multiselect = element.kendoMultiSelect(options).data('kendoMultiSelect');
			
		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}
}