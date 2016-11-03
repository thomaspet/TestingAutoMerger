import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../../../framework/core/authService';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {CompanySettingsService} from '../../../../../services/services';
import {FinancialYearService} from '../../../../../services/services';

import {Company, CompanySettings, FinancialYear} from '../../../../../unientities';
import {ISelectConfig} from '../../../../../../framework/uniform/controls/select/select';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-company-dropdown',
    template: `
        <article (clickOutside)="close()" class="navbar_userinfo_company" >
            <span class="navbar_userinfo_title" (click)="companyDropdownActive = !companyDropdownActive">{{activeCompany.Name}} {{activeYearHdr}}</span>

            <section class="navbar_userinfo_dropdown" [ngClass]="{'-is-active': companyDropdownActive}">
                <address class="companyinfo" itemtype="http://schema.org/Organization" *ngIf="company">
                    <h3 itemprop="name"> {{activeCompany.Name}} </h3>
                    <dl>
                        <dt>Org.nr</dt>
                        <dd itemprop="taxID">{{company.OrganizationNumber || ''}}</dd>
                        <dt *ngIf="company.DefaultPhone && company.DefaultPhone?.Number">Telefon</dt>
                        <dd itemprop="phone" *ngIf="company.DefaultPhone && company.DefaultPhone?.Number"><a href="tel:{{company.DefaultPhone.Number}}">{{company.DefaultPhone.Number}}</a></dd>
                        <dt>Regnskapsår</dt>
                        <dd> 
                            <uni-select [config]="selectYearConfig"
                                [items]="financialYears"
                                [value]="activeYear"
                                (valueChange)="yearSelected($event)">
                            </uni-select>
                        </dd>
                    </dl>
                </address>

                <p><a (click)="goToCompanySettings()">Innstillinger</a></p>
                <hr>

                <label class="company_select"> Velg firma
                    <uni-select [config]="selectCompanyConfig"
                                [items]="availableCompanies"
                                [value]="activeCompany"
                                (valueChange)="companySelected($event)">
                    </uni-select>
                </label>
            </section>
        </article>
    `
})

    //TODO: Should be decided if such as companies and financialYears should be retrieved during dialog opening, and not only during application load. 
    //A company may get a new account year during a session, and a user may get access to new companies during the session.
export class UniCompanyDropdown {
    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private company: CompanySettings;

    private financialYears: Array<FinancialYear> = [];
    private activeYear: FinancialYear;
    private localStorageYear: FinancialYear;

    private availableCompanies: Observable<any>;
    private selectCompanyConfig: ISelectConfig;
    private selectYearConfig: ISelectConfig;

    private activeYearHdr: string = "**";

    constructor(private _router: Router,
        private _authService: AuthService,
        private http: UniHttp,
        private companySettingsService: CompanySettingsService,
        private financialYearService: FinancialYearService) {

        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .map(response => response.json())
            .subscribe(response => this.availableCompanies = response);

        this.selectCompanyConfig = {
            displayProperty: 'Name'
        };

        this.selectYearConfig = {
            placeholder: 'Velg aktivt regnskapsår',
            template: (item) => {
                return (item.Year.toString()); //Convert to string - The <uni-select> only handle string type
            }
        };


        this.companyDropdownActive = false;
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.loadCompanyData();

    }

    private loadCompanyData() {
        this.companySettingsService.Get(1, ['DefaultPhone']).subscribe((company) => {
            this.company = company;
            this.getFinancialYear();
        });
    }

    private getFinancialYear() {
        this.localStorageYear = this.financialYearService.getActiveFinancialYearInLocalstorage(this.activeCompany.Name);
        this.financialYearService.GetAll(null).subscribe((response) => {
            this.financialYears = response;
            this.setActiveYear();
        });
    }

    private setActiveYear() {
        if (this.company != null && this.financialYears != null && this.financialYears.length > 0) {
            if (this.localStorageYear === null || this.localStorageYear.Year === undefined) {
                this.activeYear = this.financialYears.find((y) => y ? y.Year === this.company.CurrentAccountingYear : null);
            }
            else {
                this.activeYear = this.financialYears.find((y) => y ? y.Year === this.localStorageYear.Year : null);
            }
        }
        else {
            this.activeYear = null;
        }
        this.setYearInNavBarTitle();
    }

    private setYearInNavBarTitle() {
        //Show the year in nav bar title if active year is not the current accounting year for the company
        if (this.activeYear === null || this.activeYear.Year === undefined || this.activeYear.Year === this.company.CurrentAccountingYear) {
            this.activeYearHdr = "";
        }
        else {
            this.activeYearHdr = " - " + this.activeYear.Year.toString();
        }
    }

    private companySelected(selectedCompany): void {
        this.close();
        this.activeCompany = selectedCompany;
        this._authService.setActiveCompany(selectedCompany);
        this.loadCompanyData();
        this._router.navigateByUrl('/');
    }

    private yearSelected(selectedYear: FinancialYear): void {
        this.close();
        this.financialYearService.storeActiveFinancialYearInLocalstorage(selectedYear, this.activeCompany.Name);
        this.activeYear = selectedYear;
        this.setYearInNavBarTitle();
    }

    private goToCompanySettings() {
        this.companyDropdownActive = false;
        this._router.navigateByUrl('/settings/company');
    }

    private close() {
        this.companyDropdownActive = false;
    }
}
