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
		
		var element: any = $(this.element.nativeElement);

		options.format = "dd.MM.yyyy";
		options.parseFormats = [
			"dd-MM-yyyy",
			"dd/MM/yyyy",
			"dd.MM.yyyy",				
			"ddMMyyyy",
		];
		
		options.change = function(event) {
			var date = this.value();
			
			if (date === null || date === undefined) {
				var autocompleted = autocompleteDate(this.element.val());
				if (autocompleted != null) {
					date = autocompleted;
				}
			};
			
			control.updateValue(date.toISOString());
			this.value(date);
		}
		
		var datepicker = element.kendoDatePicker(options).data('kendoDatePicker');
		
		// Pass control value to kendo model
		if (control.value.length > 0) {
			datepicker.value(new Date(control.value));	
		}
	}
}

export function autocompleteDate(inputValue): Date {
	
	var input = inputValue.replace(/[^0-9]/g, "");
	
	var day, month, year;
	var date = new Date();
			
	switch (input.length) {
		case 0:
			return date;
		case 1:
			day = parseInt(input);
			month = date.getMonth();
			year = date.getFullYear();
			break;
		case 2:
			day = parseInt(input);
			month = date.getMonth();
			year = date.getFullYear();
			break;
		case 4:
		 	day = parseInt(input.slice(0,2));
			month = parseInt(input.slice(2)) - 1;
			year = date.getFullYear();
			break;
		case 6:
			day = parseInt(input.slice(0,2));
			month = parseInt(input.slice(2,4)) - 1;
			year = parseInt("20" + input.slice(4)); // må endres innen år 3000 :-)
			break;
		default:
			return null;
	}
	
	if (year < 1900) return null;
	if (month < 0 || month > 12) return null;
	if (day > new Date(0, month, 0).getDate()) return null; // if (day > max day of month)
	
	return new Date(year, month, day);	
}