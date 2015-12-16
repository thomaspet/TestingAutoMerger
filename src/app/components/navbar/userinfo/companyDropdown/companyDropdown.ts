import {Component, AfterViewInit, OnDestroy} from 'angular2/core';
import {Combobox, ComboboxConfig} from '../../../../../framework/controls/combobox/combobox'
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/fromEvent';
declare var jQuery;

@Component({
	selector: 'uni-company-dropdown',
	templateUrl: 'app/components/navbar/userinfo/companyDropdown/companyDropdown.html',
    directives: [Combobox]
})
export class CompanyDropdown implements AfterViewInit, OnDestroy {
    companies: Array<any>;
    activeCompany: any;
    comboboxConfig: ComboboxConfig;
    onCompanySelect: Function;
    
   clickSubscription: any;

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
    
    ngAfterViewInit() {
        var companySection = jQuery('#company_info').hide();
        
        this.clickSubscription =  Observable.fromEvent(document, 'click')
        .subscribe(
            (event: any) => {
                
                // Toggle section visibility when clicking the navbar item
                if (jQuery(event.target).closest('.navbar_userinfo_company').length) {
                    
                    // Avoid hiding section on clicks inside it
                    if (!jQuery(event.target).closest('#company_info').length) {
                        companySection.toggle();
                    }
                } else {
                    // Hide section on clicks outside
                    companySection.hide();
                }
            }
        );
    }
    
    ngOnDestroy() {
        this.clickSubscription.unsubscribe();
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