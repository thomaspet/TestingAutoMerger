/// <reference path="../../../../../kendo/typescript/kendo.all.d.ts" />
import { Component, AfterViewInit, ElementRef } from 'angular2/angular2';

declare var jQuery;

@Component({
	selector: 'company-dropdown',
	template: '<select style="width: 200px"></select>',
})
export class CompanyDropdown implements AfterViewInit {
	activeCompany: any; // todo: create interface ICompany when we know what a company object is
	
	dropdownOptions: kendo.ui.DropDownListOptions;
	elementRef: ElementRef;
	
	constructor(elementRef: ElementRef) {
		this.elementRef = elementRef;
		this.activeCompany = localStorage.getItem('activeCompany');		
		
		this.dropdownOptions = {
			delay: 50,
			dataTextField: 'name',
			dataValueField: 'id',
			dataSource: new kendo.data.DataSource({
				data: this.getCompanies()
			}),
			change: (event: kendo.ui.DropDownListChangeEvent) => {
				this.selectCompany(event.sender.value());
			}
		}
	}
	
	ngAfterViewInit() {
		var element = jQuery(this.elementRef.nativeElement).find('select');
		var dropdown = element.kendoDropDownList(this.dropdownOptions).data('kendoDropDownList');
		
		console.log(this.activeCompany);
		dropdown.value(this.activeCompany);
	}
	
	selectCompany(companyID) {
		// get full company object, not just ID?
		localStorage.setItem('activeCompany', companyID.toString());
		// router.navigateByUrl(...)
	}

	private getCompanies(): Array<any> {		
		// todo: get companies from api
		var companies = [
			{ id: 1, name: 'Unimicro AS' },
			{ id: 2, name: 'Google' },
			{ id: 3, name: 'Apple' },
			{ id: 4, name: 'Microsoft' },
		];
		return companies;
	}
	
}