/// <reference path="../../../kendo/typescript/kendo.all.d.ts" />
import { Component, AfterViewInit } from 'angular2/angular2';

export interface ICompany {
	id: number,
	name: string
}

@Component({
	selector: 'company-dropdown',
	template: '<select style="width: 200px" id="companyDropdown"></select>',
	directives: []
})
export class CompanyDropdown implements AfterViewInit {
	// todo: type these
	companies: Array<ICompany>;
	lastActiveCompany: ICompany;
	
	dropdownOptions: kendo.ui.DropDownListOptions;
	
	constructor() {
		var vm = this;
		
		this.companies = this.getCompanies();	
		this.lastActiveCompany = localStorage.getItem('lastActiveCompany');		
		
		this.dropdownOptions = {
			delay: 50,
			dataTextField: 'name',
			dataValueField: 'id',
			dataSource: new kendo.data.DataSource({
				data: this.companies
			}),
			change: function(event: kendo.ui.DropDownListChangeEvent) {
				vm.selectCompany(this.value());
			}
		}
		
		console.log(this.dropdownOptions);
	}
	
	ngAfterViewInit() {
		var element: any = $('#companyDropdown');
		var dropdown = element.kendoDropDownList(this.dropdownOptions).data('kendoDropDownList');
		
	}
	
	selectCompany(companyID: number) {
		console.log('Selected company: ' + companyID);
	}

	private getCompanies(): Array<any> {
		var companies = localStorage.getItem('companies');
		
		if (!companies || companies.length === 0) {
			// todo: get companies from api
			companies = [
				{ id: 1, name: 'Unimicro AS' },
				{ id: 2, name: 'Google' },
				{ id: 3, name: 'Apple' },
				{ id: 4, name: 'Microsoft' },
			];
		}
		
		return companies;
	}
}