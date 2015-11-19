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
		
		options.highlightFirst = true; // This setting is important! Forcing only valid inputs wont work without it.
		var validSelection = false;
		
		// Reset validSelection to false when the input text changes
		options.dataBound = function(e) {
			validSelection = false;
		}
		
		// Update control value and set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.ComboBoxSelectEvent) {
			control.updateValue(this.value());
			validSelection = true;
		}
		
		// Reset the fields on change events (blur, enter, ...) if input was invalid
		options.change = function(e) {
			if (!validSelection) {
				this.value('');
				control.updateValue('');	
			}
		}
		
		var comboboxElement: any = $(this.element.nativeElement);
		comboboxElement.kendoComboBox(options);
	}
}