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
	
	ngAfterViewInit() {
		var multiselect;
		var element: any = $(this.element.nativeElement);

		var control = this.config.control;
		var options = this.config.kOptions;

		options.highlightFirst = true;
		options.change = function(event: kendo.ui.MultiSelectChangeEvent) {
			control.updateValue(this.value());
		};

		if (element.data('kendoMultiSelect')) {
			this._destroyKendoWidget(element);
		}
		multiselect = element.kendoMultiSelect(options).data('kendoMultiSelect');

		// init to control value
		var controlValues = [];
		if (control.value.length > 0) {
			multiselect.value(control.value);
			multiselect.trigger('change');
		}
	}

	private _destroyKendoWidget(HTMLElement) {
		HTMLElement.data('kendoMultiSelect').destroy();
		let parent:any = $(HTMLElement[0].parentNode);
		parent.find('div.k-widget.k-multiselect').remove();
	}
}