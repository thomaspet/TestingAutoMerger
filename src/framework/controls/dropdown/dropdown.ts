import {Directive, AfterViewInit, ElementRef, Input, Control} from 'angular2/angular2';

export interface DropdownConfig {
	control: Control;
	kOptions: kendo.ui.DropDownListOptions;
}

@Directive({
	selector: '[dropdown]'
})
export class Dropdown implements AfterViewInit {
	@Input() config: DropdownConfig;
	
	constructor(public element: ElementRef) { }
	
	afterViewInit() {
		var vm = this;
		var dropdownElement: any = $(this.element.nativeElement);
		
		this.config.kOptions.select = function(event) {			
			vm.config.control.updateValue(this.value());
		}
		
		dropdownElement.kendoDropDownList(this.config.kOptions);
	}
}
