import {Directive, AfterViewInit,ElementRef, Input, Control, Observable} from 'angular2/angular2';

export interface AutocompleteConfig {
	control: Control;
	kOptions: kendo.ui.AutoCompleteOptions;
}

@Directive({
	selector:'[autocomplete]'
})
export class Autocomplete implements AfterViewInit {
	@Input() config: AutocompleteConfig;
	
	constructor(public element:ElementRef) { }
	
	afterViewInit() {
		var element: any = $(this.element.nativeElement);

		var control = this.config.control;
		var options: kendo.ui.AutoCompleteOptions = this.config.kOptions;
		
		options.highlightFirst = true; // This setting is important! Forcing only valid inputs wont work without it.
		var validSelection = false;
		
		// Reset validSelection when input changes
		Observable.fromEvent(element, 'keyup').subscribe((event) => {
			validSelection = false;
		});
		
		// Update control value and set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.AutoCompleteSelectEvent) {
			let item:any = event.item;
			control.updateValue(item.text());
			validSelection = true;
		}
		
		// Reset the fields on change events (blur, enter, ...) if input was invalid
		options.change = function(event: kendo.ui.AutoCompleteChangeEvent) {
			if (!validSelection) {
				this.value('');
				control.updateValue('');	
			}
		}

		//don't create the kendo component if it exists
		if (!element.data('kendoAutoComplete')) {
			element.kendoAutoComplete(options);
		}
	}
}