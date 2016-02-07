import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';

import {InputTemplateString} from '../inputTemplateString';
declare var jQuery;

export interface DatepickerConfig {
	control: Control;
	kOptions: kendo.ui.DatePickerOptions;
}

@Component({
	selector: 'uni-datepicker',
	template: InputTemplateString
})
export class UniDatepicker implements AfterViewInit, OnDestroy {
	@Input() config: DatepickerConfig;
    nativeElement;
		
	constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }
	
	ngAfterViewInit() {
		var control = this.config.control;
		var options = this.config.kOptions;
		var datepicker;

		options.format = "dd.MM.yyyy";
		options.parseFormats = [
			"dd-MM-yyyy",
			"dd/MM/yyyy",
			"dd.MM.yyyy",				
			"ddMMyyyy",
		];
		
		options.change = function(event: kendo.ui.DatePickerChangeEvent) {
			var date = this.value();
			
			if (date === null || date === undefined) {
				var autocompleted = autocompleteDate(this.element.val());
				if (autocompleted != null) {
					date = autocompleted;
				}
			};
			
			if (date) {
				control.updateValue(date.toISOString());
				this.value(date);
			}
		}
		datepicker = this.nativeElement.find('input').first().kendoDatePicker(options).data('kendoDatePicker');
		
		// Trigger kendo change event on keyup (enter) and blur in the textbox 
		Observable.fromEvent(this.nativeElement, 'keyup')
		.subscribe(function (event: any) {			
			if (event.keyCode && event.keyCode === 13) {
				datepicker.trigger('change');
			}	
		});
		
		Observable.fromEvent(this.nativeElement, 'blur').subscribe((e) => {
			datepicker.trigger('change');
		});		

		datepicker.value(control.value);
	}
    
    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    } 
}

function autocompleteDate(inputValue): Date {
	
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
		case 3:
			day = parseInt(input.slice(0,2));
			month = parseInt(input[2]) - 1;
			year = date.getFullYear();
			if (day > new Date(0, month, year).getDate()) {
				day = parseInt(input[0]);
				month = parseInt(input.slice(1)) - 1;
			}
			break;
		case 4:
		 	day = parseInt(input.slice(0,2));
			month = parseInt(input.slice(2)) - 1;
			year = date.getFullYear();
			break;
		case 6:
			day = parseInt(input.slice(0,2));
			month = parseInt(input.slice(2,4)) - 1;
			year = parseInt(date.getFullYear().toString().substr(0,2) + input.slice(4));
			break;
		default:
			return null;
	}
	
	if (year < 1900) return null;
	if (month < 0 || month > 12) return null;
	if (day > new Date(0, month, 0).getDate()){
		console.log("null");
		console.log(day);
		console.log(new Date(0, month, 0).getDate());
		return null; // if (day > max day of month)
	}
	return new Date(year, month, day);	
}