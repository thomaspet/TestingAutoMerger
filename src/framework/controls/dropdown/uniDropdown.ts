import { Component, AfterViewInit, ElementRef, Input, Output, EventEmitter } from 'angular2/core';
declare var jQuery;

@Component({
	selector: 'uni-dropdown',
	template: '<select style="width: 200px"></select>',
	host: {
		'[value]': 'model',
		'(input)': 'modelChange.next($event.target.value)'
	}
})
export class UniDropdown implements AfterViewInit {
	@Input() config: kendo.ui.DropDownListOptions;
	@Input() model: any;
	@Output() modelChange: EventEmitter<any> = new EventEmitter();
		
	constructor(public elementRef: ElementRef) {
		this.modelChange = new EventEmitter<any>();
	 }
	
	ngAfterViewInit() {
		var vm = this;
		var element = jQuery(this.elementRef.nativeElement).find('select');
		
		this.config.change = function(event: kendo.ui.DropDownListChangeEvent) {
			vm.modelChange.next(this.value());
		}
		
		var dropdown = element.kendoDropDownList(this.config).data('kendoDropDownList');
		dropdown.value(this.model);
	}
}