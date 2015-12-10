import {Component, AfterViewInit} from 'angular2/angular2';
declare var jQuery;

@Component({
	selector: 'uni-company-dropdown',
	templateUrl: 'app/components/navbar/userinfo/companyDropdown/companyDropdown.html'
})
export class CompanyDropdown implements AfterViewInit {
    dropDownisOpen: boolean;
    companies: Array<any>;
    currentActiveCompany: string;

    constructor() {
        this.companies = this.getCompanies();
        this.currentActiveCompany = this.getCurrentActiveCompany();
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

    getCurrentActiveCompany(): string {
        //return JSON.parse(localStorage.getItem('activeCompany')).name;

        var activeComp = JSON.parse(localStorage.getItem('activeCompany'));
        if (activeComp) {
            return activeComp.name;
        } else {
            return 'Select Company';
        }
    }

    onCompanySelect(comp, e): void {
        event.preventDefault();
        if (comp.name != this.currentActiveCompany) {
            localStorage.setItem('activeCompany', JSON.stringify(comp));
            this.currentActiveCompany = this.getCurrentActiveCompany();
        }
        this.dropDownisOpen = false;
    }

    ngAfterViewInit() { }
}