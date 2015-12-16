import {Component, AfterViewInit} from 'angular2/core';
import {Combobox, ComboboxConfig} from '../../../../../framework/controls/combobox/combobox'

declare var jQuery;

@Component({
	selector: 'uni-company-dropdown',
	templateUrl: 'app/components/navbar/userinfo/companyDropdown/companyDropdown.html',
    directives: [Combobox]
})
export class CompanyDropdown implements AfterViewInit {
    companies: Array<any>;
    activeCompany: any;
    comboboxConfig: ComboboxConfig;
    onCompanySelect: Function;
    
    showSection: boolean = false;

    constructor() {
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.companies = this.getCompanies();
        
        this.comboboxConfig = {
            onSelect: (companyID) => {
                this.selectCompany(companyID);  
            },
			kOptions:  {
				delay: 50,
				dataTextField: 'name',
				dataValueField: 'id',
				dataSource: new kendo.data.DataSource({
					data: this.companies
				}),
				template: '<span>#: data.id # - #: data.name #</span>'
			}
		}
            
    }
	
    //How to get companies? Already gotten?
    getCompanies(): Array<any> {
        return [
            { id: 1, name: 'Unimicro AS' },
            { id: 2, name: 'Google' },
            { id: 3, name: 'Apple' },
            { id: 4, name: 'Microsoft' },
        ]
    }

    selectCompany(companyID): void {
        var selectedCompany;
        
        this.companies.forEach((company) => {
            if (company.id == companyID) {
                selectedCompany = company;
            }
        })
        
        if (selectedCompany) {
            localStorage.setItem('activeCompany', JSON.stringify(selectedCompany));
            this.activeCompany = selectedCompany;
        }

    }
}