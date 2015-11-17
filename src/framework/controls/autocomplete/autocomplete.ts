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
		
		options.change = function(event: kendo.ui.AutoCompleteChangeEvent) {
			var dataItem = event.sender.dataItem(0);
			
			// If dataItem is null it means the input does not match an item in the datasource
			if (dataItem === null || dataItem === undefined) {
				control.updateValue('');
				this.value('');
				return;
			}
			
			control.updateValue(dataItem);
		}

		var autocompleteElement: any = $(this.element.nativeElement);
		autocompleteElement.kendoAutoComplete(options);
		
	}
}