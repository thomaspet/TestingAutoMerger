import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../../../framework/core/authService';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {CompanySettingsService} from '../../../../../services/services';
import {FinancialYearService} from '../../../../../services/services';
import {UserService} from '../../../../../services/services';

import {CompanySettings, FinancialYear} from '../../../../../unientities';
import {ISelectConfig} from '../../../../../../framework/uniform/controls/select/select';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-company-dropdown',
    template: `
        <article (clickOutside)="close()"
            class="navbar_company">

            <span class="navbar_company_title"
                (click)="companyDropdownActive = !companyDropdownActive">
                {{activeCompany.Name}}<span class="navbar_company_title_year">{{activeYearHdr}}</span>
            </span>

            <section class="navbar_company_dropdown"
                [attr.aria-expanded]="companyDropdownActive">

                <h2> {{username}} </h2>

                <dl>

                <uni-select class="navbar_company_select"
                            [config]="selectCompanyConfig"
                            [items]="availableCompanies"
                            [value]="activeCompany"
                            (valueChange)="companySelected($event)">
                </uni-select>


                    <dt *ngIf="company?.OrganizationNumber">Org.nr</dt>
                    <dd *ngIf="company?.OrganizationNumber" itemprop="taxID">{{company.OrganizationNumber | uninumberformat:'orgno'}}</dd>

                    <dt *ngIf="company?.DefaultPhone?.Number">Telefon</dt>
                    <dd itemprop="phone" *ngIf="company?.DefaultPhone?.Number">
                        <a href="tel:{{company.DefaultPhone.Number}}">{{company.DefaultPhone.Number}}</a>
                    </dd>
                </dl>

                <p class="navbar_company_taxyear">Regnskapsår
                    <uni-select class="navbar_company_taxyearselect"
                        *ngIf="financialYears?.length > 1"
                        [config]="selectYearConfig"
                        [items]="financialYears"
                        [value]="activeYear"
                        (valueChange)="yearSelected($event)">
                    </uni-select>
                    <span class="navbar_company_activeYear" *ngIf="financialYears?.length <= 1">{{activeYear?.Year}}</span>
                </p>

                <p>
                    <a href="/#/settings/company" class="navbar_company_settings" (click)="close()">Innstillinger</a>
                    <button (click)="logOut()" class="navbar_company_logout">Logg ut</button>
                </p>

            </section>
        </article>
    `
})

    // TODO: Should be decided if such as companies and financialYears should be retrieved during dialog opening, and not only during application load.
    // A company may get a new account year during a session, and a user may get access to new companies during the session.
export class UniCompanyDropdown {
    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private company: CompanySettings;

    private username: string;

    private financialYears: Array<FinancialYear> = [];
    private activeYear: FinancialYear;
    private localStorageYear: FinancialYear;

    private availableCompanies: Observable<any>;
    private selectCompanyConfig: ISelectConfig;
    private selectYearConfig: ISelectConfig;

    private activeYearHdr: string = '';

    constructor(
        private _router: Router,
        private _authService: AuthService,
        private userService: UserService,
        private http: UniHttp,
        private companySettingsService: CompanySettingsService,
        private financialYearService: FinancialYearService) {

        this.userService.getCurrentUser().subscribe((user) => {
            this.username = user.DisplayName;
        });

        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .map(response => response.json())
            .subscribe((response) => {
                this.availableCompanies = response;
                this.selectCompanyConfig.searchable = response.length >= 8;
            });

        this.selectCompanyConfig = {
            displayProperty: 'Name'
        };

        this.selectYearConfig = {
            placeholder: 'Velg aktivt regnskapsår',
            template: (item) => {
                return (item.Year.toString()); // Convert to string - The <uni-select> only handle string type
            },
            searchable: false
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
        if (this.company !== null && this.financialYears !== null && this.financialYears.length > 0) {
            if (this.localStorageYear === null || this.localStorageYear.Year === undefined) {
                this.activeYear = this.financialYears.find((y) => y ? y.Year === this.company.CurrentAccountingYear : null);
            } else {
                this.activeYear = this.financialYears.find((y) => y ? y.Year === this.localStorageYear.Year : null);
            }
        } else {
            this.activeYear = null;
        }
        this.setYearInNavBarTitle();
    }

    private setYearInNavBarTitle() {
        // Show the year in nav bar title if active year is not the current accounting year for the company
        if (this.activeYear === null || this.activeYear.Year === undefined || this.activeYear.Year === this.company.CurrentAccountingYear) {
            this.activeYearHdr = '';
        } else {
            let enspace = '\u2002';
            this.activeYearHdr = enspace + this.activeYear.Year;
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

    private close() {
        this.companyDropdownActive = false;
    }

    private logOut() {
        this._authService.clearAuthAndGotoLogin();
    }
}
