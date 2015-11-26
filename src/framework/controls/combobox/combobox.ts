import {Directive, AfterViewInit, ElementRef, Input, Control, Observable} from 'angular2/angular2';

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
		var element: any = $(this.element.nativeElement);

		//don't create the kendo component if it exists
		if (element.data('kendoComboBox')) {
			return;
		}

		var control = this.config.control;
		var options = this.config.kOptions;
		
		var validSelection = false;
	
		// Set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.ComboBoxSelectEvent) {
			validSelection = true;
		}
		
		// Store value in control if the selection was valid (input matches an item in the dataSource)
		options.change = function(e) {
			if (validSelection) {
				control.updateValue(this.value());
			} else {
				this.value('');
				control.updateValue('');	
			}
		}
		

		var combobox = element.kendoComboBox(options).data('kendoComboBox');
		
		// Reset validSelection when the input text changes
		Observable.fromEvent(combobox.input, 'keyup').subscribe((event: any) => {
			validSelection = false;	
		});
	}
}