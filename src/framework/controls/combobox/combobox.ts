import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

export interface ComboboxConfig {
	control: Control;
	kOptions: kendo.ui.ComboBoxOptions;
}

@Directive({
	selector: '[combobox]'
})
export class Combobox implements AfterViewInit {
	@Input() config: ComboboxConfig;
	
	constructor(public element: ElementRef) { }
	
	afterViewInit() {
		var control = this.config.control;
		var options = this.config.kOptions;
		
		options.change = function(event: kendo.ui.ComboBoxSelectEvent) {
			var dataItem = event.sender.dataItem();
			
			// If input does not match any item in datasource: Reset fields and return.
			if (dataItem === undefined) {
				control.updateValue('');
				this.value('');
				return;
			}
			
			control.updateValue(dataItem[options.dataValueField]);
		}
		
		var comboboxElement: any = $(this.element.nativeElement);
		comboboxElement.kendoComboBox(options);
	}
}