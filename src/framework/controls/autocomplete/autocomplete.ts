import {Directive, AfterViewInit,ElementRef, Input, Control} from 'angular2/angular2';

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
		
		var control = this.config.control;
		var options: kendo.ui.AutoCompleteOptions = this.config.kOptions;
		
		options.highlightFirst = true; // This setting is important! Forcing only valid inputs wont work without it.
		var validSelection = false;
		
		// Reset validSelection to false when the input text changes
		options.dataBound = function(e) {
			validSelection = false;
		}
		
		// Update control value and set validSelection to true. Select event only fires when input text is valid.
		options.select = function(event: kendo.ui.AutoCompleteSelectEvent) {
			control.updateValue(this.value());
			validSelection = true;
		}
		
		// Reset the fields on change events (blur, enter, ...) if input was invalid
		options.change = function(event: kendo.ui.AutoCompleteChangeEvent) {
			if (!validSelection) {
				this.value('');
				control.updateValue('');	
			}
		}

		var autocompleteElement: any = $(this.element.nativeElement);
		autocompleteElement.kendoAutoComplete(options);
	}
}