/// <reference path="../../../../../kendo/typescript/kendo.all.d.ts" />
import { Component, AfterViewInit, ElementRef } from 'angular2/angular2';

export interface ICompany {
	id: number,
	name: string
}

declare var jQuery: any;

@Component({
	selector: 'company-dropdown',
	template: '<select style="width: 200px"></select>',
	directives: []
})
export class CompanyDropdown implements AfterViewInit {
	// todo: type these
	companies: Array<ICompany>;
	lastActiveCompany: ICompany;
	
	dropdownOptions: kendo.ui.DropDownListOptions;
	elementRef: ElementRef;
	
	constructor(elementRef: ElementRef) {
		this.elementRef = elementRef;
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
	}
	
	ngAfterViewInit() {
		var element = jQuery(this.elementRef.nativeElement).find('select');
		console.log(element);
		var dropdown = element.kendoDropDownList(this.dropdownOptions).data('kendoDropDownList');
	}
	
	selectCompany(companyID: number) {
		localStorage.setItem('activeCompany', companyID.toString());
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