import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {InputTemplateString} from "../inputTemplateString";
declare var jQuery;

export interface NumericInputConfig {
	control: Control,
	kOptions: kendo.ui.NumericTextBoxOptions
}

@Component({
	selector: "uni-numeric",
    template: InputTemplateString
})
export class UniNumericInput implements AfterViewInit, OnDestroy {
	@Input() config: NumericInputConfig;
	nativeElement;
    
	constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }
	
	ngAfterViewInit() {
        var numericInput;

        var control = this.config.control;
        var options = this.config.kOptions;

        options.change = function(event) {
            control.updateValue(this.value());
        };
        
        numericInput = this.nativeElement.find('input').first().kendoNumericTextBox(options).data('kendoNumericTextBox');
        numericInput.value(control.value);
	}

    // Remove kendo markup when component is destroyed to avoid duplicates
    ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    } 
}