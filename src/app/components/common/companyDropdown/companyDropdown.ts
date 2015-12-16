import { Component, AfterViewInit, ElementRef } from 'angular2/core';
import { Router } from 'angular2/router';
declare var jQuery;

@Component({
	selector: 'company-dropdown',
	template: '<select style="width: 400px"></select>',
})
export class CompanyDropdown implements AfterViewInit {	
	activeCompany: any; // todo: create interface ICompany when we know what a company object is
	dropdownOptions: kendo.ui.DropDownListOptions;
	
	// todo: get this from backend
	companies = [
		{ id: 1, name: 'Unimicro AS' },
		{ id: 2, name: 'Google' },
		{ id: 3, name: 'Apple' },
		{ id: 4, name: 'Microsoft' },
	];
	
	constructor(public elementRef: ElementRef, public router: Router) {
		this.activeCompany = localStorage.getItem('activeCompany');		
		
		this.dropdownOptions = {
			delay: 50,
			dataTextField: 'name',
			dataValueField: 'id',
			dataSource: new kendo.data.DataSource({
				data: this.getCompanies()
			}),
			change: (event: kendo.ui.DropDownListChangeEvent) => {
				var companyID = event.sender.value();
				this.onCompanySelect(companyID);
			},
			optionLabel: 'Select a company'
		}
	}
	
	ngAfterViewInit() {
		var element = jQuery(this.elementRef.nativeElement).find('select');
		var dropdown = element.kendoDropDownList(this.dropdownOptions).data('kendoDropDownList');
		
		console.log(this.activeCompany);
		dropdown.value(this.activeCompany);
	}
	
	private onCompanySelect(companyID) {
		var selectedCompany;
		
		this.companies.forEach((company) => {
			if(company.id == companyID) {
				selectedCompany = company;
			}
		})
		
		localStorage.setItem('activeCompany', JSON.stringify(selectedCompany));
		
		var url = localStorage.getItem('lastNavigationAttempt');
		if (url) {
			localStorage.removeItem('lastNavigationAttempt');
			this.router.navigateByUrl(url);
			return;	
		}
		
		this.router.navigateByUrl('/');			
	}

	private getCompanies(): Array<any> {		
		// todo: get companies from api
		return this.companies;
	}
	
}