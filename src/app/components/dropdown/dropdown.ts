import {Directive, AfterViewInit, ElementRef, Input} from 'angular2/angular2';

// export interface DropdownConfig {
// 	// TODO: Use kendo types when we get typings file into project
// 	dataSource: any;
// 	dataTextField?: string; // value to display in the dropdown list (from datasource)
// 	dataValueField?: string; // value to store in the model (from datasource)
// 	filter?: string; // contains - startswith - endswith
// 	
// 	enable?: boolean; // enabled/disabled state
// 	height?: number; // height of dropdown in pixels (200 default)
// 	ignoreCase?: boolean; // default true
// 	minLength?: number; // number of characters that must be typed before search starts (1 default)
// 	optionLabel?: string; // placeholder for when no item is selected
// 	
// }

@Directive({
	selector: '[dropdown]',
	properties: ['ngControl','formControl'],
	host: {'ng-control':'ngControl'}
})
export class Dropdown implements AfterViewInit {
	@Input() config: any; // http://docs.telerik.com/kendo-ui/api/javascript/ui/dropdownlist
	
	formControl;
	ngControl;
	
	constructor(public element: ElementRef) { }
	
	afterViewInit() {
		this.config.select = function(event) {
			let control = component.formControl.form.controls[component.ngControl];
			let dataItem = this.dataItem(event.item.index());
			control.updateValue(dataItem.id); 
		}
		
		var component = this;
		var elem:any = $(this.element.nativeElement);
		elem.kendoDropDownList(this.config);
	}
}