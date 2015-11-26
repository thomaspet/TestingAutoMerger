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
		var element: any = $(this.element.nativeElement);
		var dropdown;

		this.config.kOptions.change = function(event) {
			vm.config.control.updateValue(this.value());
		}

		//don't create the kendo component if it exists
		if (!element.data('kendoDropDownList')) {
			dropdown = element.kendoDropDownList(this.config.kOptions);
		} else {
			dropdown = element.data('kendoDropDownList');
		}

		dropdown.data('kendoDropDownList').value(vm.config.control.value); // init to control
	}
}
