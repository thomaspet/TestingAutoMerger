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
	
	ngAfterViewInit() {
		var vm = this;
		var element: any = $(this.element.nativeElement);
		var dropdown;

		this.config.kOptions.change = function(event) {
			vm.config.control.updateValue(this.value());
		}

		//don't create the kendo component if it exists
		if (element.data('kendoDropDownList')) {
			this._destroyKendoWidget(element);
		}
		dropdown = element.kendoDropDownList(this.config.kOptions).data('kendoDropDownList');

		dropdown.value(vm.config.control.value); // init to control
	}

	private _destroyKendoWidget(HTMLElement) {
		HTMLElement.data('kendoDropDownList').destroy();
		let parent:any = $(HTMLElement[0].parentNode);
		parent.find('span.k-widget.k-dropdown').remove();
	}
}
