import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

export interface DatepickerConfig {
	control: Control;
	kOptions: kendo.ui.DatePickerOptions;
}

@Directive({
	selector: '[datepicker]'
})
export class Datepicker implements AfterViewInit {
	@Input() config: DatepickerConfig;
	
	constructor(public element: ElementRef) { }
	
	afterViewInit() {
		var control = this.config.control;
		var options = this.config.kOptions;
		
		// Does angular 2 have something like angular.extend() in 1.4? 
		// would be nice to extend the kOptions object instead of overwriting it
		options.format = "dd.MM.yyyy";
		options.parseFormats = [
			"dd-MM-yyyy",
			"dd/MM/yyyy",
			"dd.MM.yyyy",
				
			"MM-dd-yyyy",
			"MM/dd/yyyy",
			"MM.dd.yyyy",
				
			"ddMMyyyy",
			"MMddyyyy",
		];
		
		options.change = function(event) {
			var date = this.value();
			
			if (date === null || date === undefined) return;
			
			control.updateValue(date.toISOString());
			this.value(date);
		}
		
		var element: any = $(this.element.nativeElement);
		var datepicker = element.kendoDatePicker(options).data('kendoDatePicker');
		
		// Pass control value to kendo model
		if (control.value.length > 0) {
			datepicker.value(new Date(control.value));	
		}
	}
}