import {Component, AfterViewInit,ElementRef} from 'angular2/angular2';

@Component({
	selector:'autocomplete',
	properties:['ngControl','formControl'],
	template:'<input type="text" />',
	host: {'ng-control':'ngControl'}
})
export class Autocomplete implements AfterViewInit {
	formControl;
	ngControl;
	
	constructor(public element:ElementRef) {
		
	}
	
	afterViewInit() {
		var component = this;
		$(this.element.nativeElement.children[0]).kendoAutoComplete({
			dataTextField:'name',
			dataValueField:'id',
			template: '<span>#: data.id # - #: data.name #</span>',
			dataSource:[
				{id:"1",name:"Jorge"},
				{id:"2",name:"Frank"}
			],
			select:function(event) {
				let control = component.formControl.form.controls[component.ngControl];
				let dataItem = this.dataItem(event.item.index());
				control.updateValue(dataItem.id); 
			}
		});
	}
}