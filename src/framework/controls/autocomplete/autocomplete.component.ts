import {Directive, AfterViewInit,ElementRef} from 'angular2/angular2';

@Directive({
	selector:'[autocomplete]',
	properties:['ngControl','formControl'],
	host: {'ng-control':'ngControl'}
})
export class Autocomplete implements AfterViewInit {
	formControl;
	ngControl;
	
	constructor(public element:ElementRef) {
		
	}
	
	afterViewInit() {
		var component = this;
		var elem:any = $(this.element.nativeElement);
		elem.kendoAutoComplete({
			dataTextField:'name',
			dataValueField:'id',
			template: '<span>#: data.id # - #: data.name #</span>',
			dataSource:[
				{id:"1",name:"Jorge"},
				{id:"2",name:"Frank"}
			],
			select:function(event:any) {
				let control = component.formControl.form.controls[component.ngControl];
				let dataItem = this.dataItem(event.item.index());
				control.updateValue(dataItem.id); 
			}
		});
	}
}