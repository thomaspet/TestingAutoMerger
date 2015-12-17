import { Component, AfterViewInit, ElementRef } from 'angular2/core';
import { Router } from 'angular2/router';
declare var jQuery;

@Component({
	selector: 'company-select',
	template: '<select style="width: 400px"></select>',
})
export class CompanySelect implements AfterViewInit {	
	// todo: create interface ICompany when we know what a company object is
	activeCompany: any; 
	companies: Array<any>;
	dropdownOptions: kendo.ui.DropDownListOptions;
	
	constructor(public elementRef: ElementRef, public router: Router) {
		this.activeCompany = localStorage.getItem('activeCompany');		
		
		// todo: get these from api
		this.companies = [
			{ id: 1, name: 'Unimicro AS' },
			{ id: 2, name: 'Google' },
			{ id: 3, name: 'Apple' },
			{ id: 4, name: 'Microsoft' },
		];
				
		this.dropdownOptions = {
			delay: 50,
			dataTextField: 'name',
			dataValueField: 'id',
			dataSource: new kendo.data.DataSource({
				data: this.companies
			}),
			change: (event: kendo.ui.DropDownListChangeEvent) => {
				var companyID = event.sender.value().toString();
				this.onCompanySelect(companyID);
			},
			optionLabel: 'Select a company'
		}
	}
	
	ngAfterViewInit() {
		var element = jQuery(this.elementRef.nativeElement).find('select');
		var dropdown = element.kendoDropDownList(this.dropdownOptions).data('kendoDropDownList');
		
		dropdown.value(this.activeCompany);
	}
	
	private onCompanySelect(companyID) {
		this.companies.forEach((company) => {
			if (company.id == companyID) {
				localStorage.setItem('activeCompany', JSON.stringify(company));
			}
		})
		
		var url = localStorage.getItem('lastNavigationAttempt') || '/';
		localStorage.removeItem('lastNavigationAttempt');
		this.router.navigateByUrl(url);		
	}
}