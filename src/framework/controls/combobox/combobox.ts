import {Directive, AfterViewInit, ElementRef, Input} from 'angular2/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';
import {Control} from 'angular2/common';

export interface ComboboxConfig {
	control?: Control;
	onSelect?: Function;
	kOptions: kendo.ui.ComboBoxOptions;
}


@Directive({
	selector: '[combobox]'
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
		//don't create the kendo component if it exists
		if (!element.data('kendoComboBox')) {
			combobox = element.kendoComboBox(options).data('kendoComboBox');
		} else {
			combobox = element.data('kendoComboBox');
			this._destroyKendoWidget(element);
			combobox = element.kendoComboBox(options).data('kendoComboBox');
		}

		// Reset validSelection when the input text changes
		Observable.fromEvent(combobox.input, 'keyup').subscribe((event: any) => {
			validSelection = false;	
		});
		
		if (control) combobox.value(control.value);
	}

	private _destroyKendoWidget(HTMLElement) {
		HTMLElement.data('kendoComboBox').destroy();
		let parent:any = $(HTMLElement[0].parentNode);
		parent.find('span.k-widget.k-combobox').remove();
	}
}