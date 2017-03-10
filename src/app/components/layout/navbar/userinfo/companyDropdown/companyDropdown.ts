import {Component, ViewChildren, QueryList, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {CompanySettings, FinancialYear} from '../../../../../unientities';
import {UniSelect, ISelectConfig} from 'uniform-ng2/main';
import {AuthService} from '../../../../../../framework/core/authService';
import {
    CompanySettingsService,
    CompanyService,
    FinancialYearService,
    AltinnAuthenticationService,
    UserService,
    ErrorService
} from '../../../../../services/services';

@Component({
    selector: 'uni-company-dropdown',
    template: `
        <article (clickOutside)="close()"
            class="navbar_company">

            <span class="navbar_company_title"
                (click)="companyDropdownActive = !companyDropdownActive">
                <span class="navbar_company_title_name">{{activeCompany.Name}}</span>
                <span class="navbar_company_title_year">{{activeYear}}</span>
            </span>

            <section class="navbar_company_dropdown"
                [attr.aria-expanded]="companyDropdownActive">

                <h2> {{username}} </h2>

                <dl>

                <uni-select class="navbar_company_select"
                            *ngIf="availableCompanies"
                            [config]="selectCompanyConfig"
                            [items]="availableCompanies"
                            [value]="activeCompany"
                            (valueChange)="companySelected($event)">
                </uni-select>


                    <dt *ngIf="companySettings?.OrganizationNumber">Org.nr</dt>
                    <dd *ngIf="companySettings?.OrganizationNumber" itemprop="taxID">{{companySettings.OrganizationNumber | uninumberformat:'orgno'}}</dd>

                    <dt *ngIf="companySettings?.DefaultPhone?.Number">Telefon</dt>
                    <dd itemprop="phone" *ngIf="companySettings?.DefaultPhone?.Number">
                        <a href="tel:{{companySettings.DefaultPhone.Number}}">{{companySettings.DefaultPhone.Number}}</a>
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

                    <span class="navbar_company_activeYear" *ngIf="financialYears?.length <= 1">
                        {{activeYear || ''}}
                    </span>
                </p>

                <p>
                    <!--<a href="/#/settings/company" class="navbar_company_settings" (click)="close()">Innstillinger</a>-->
                    <a routerLink="settings/company" class="navbar_company_settings" (click)="close()">Innstillinger</a>
                    <button (click)="logOut()" class="navbar_company_logout">Logg ut</button>
                </p>

            </section>
        </article>
    `
})

// TODO: Should be decided if such as companies and financialYears should be retrieved during dialog opening, and not only during application load.
// A company may get a new account year during a session, and a user may get access to new companies during the session.
export class UniCompanyDropdown {
    @ViewChildren(UniSelect)
    private dropdowns: QueryList<UniSelect>;

    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private companySettings: CompanySettings;

    private username: string;

    private financialYears: Array<FinancialYear> = [];
    private activeYear: number;

    private availableCompanies: Observable<any>;
    private selectCompanyConfig: ISelectConfig;
    private selectYearConfig: ISelectConfig;

    constructor(
        private altInnService: AltinnAuthenticationService,
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private companyService: CompanyService,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef
    ) {
        this.userService.getCurrentUser().subscribe((user) => {
            this.username = user.DisplayName;
        }, err => this.errorService.handle(err));

        this.companyService.GetAll(null).subscribe(
            res => this.availableCompanies = res,
            err => this.errorService.handle(err)
        );

        this.financialYearService.lastSelectedYear$.subscribe(year => {
            this.activeYear = year;
        });

        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.companyDropdownActive = false;

        this.selectCompanyConfig = {
            displayProperty: 'Name'
        };

        this.selectYearConfig = {
            template: (item) => typeof item === 'number' ? item.toString() : item.Year.toString(),
            searchable: false
        };

        this.loadCompanyData();
        this.authService.companyChange.subscribe((company) => {
            this.activeCompany = company;
            this.loadCompanyData();
        });
    }

    private loadCompanyData() {
        this.altInnService.clearAltinnAuthenticationDataFromLocalstorage();
        Observable.forkJoin(
            this.companySettingsService.Get(1, ['DefaultPhone']),
            this.financialYearService.GetAll(null)
        ).subscribe(
            (res) => {
                this.companySettings = res[0];
                this.financialYears = res[1];
                this.selectDefaultYear(this.financialYears, this.companySettings);
                this.cdr.markForCheck(); // not sure where this should be
            },
            err => this.errorService.handle(err)
            );
    }

    private companySelected(selectedCompany): void {
        this.close();
        if (selectedCompany !== this.activeCompany) {
            this.authService.setActiveCompany(selectedCompany);
            this.router.navigateByUrl('/');
        }
    }

    private selectDefaultYear(financialYears: FinancialYear[], companySettings: CompanySettings): void {
        let localStorageYear = this.financialYearService.getYearInLocalStorage();
        this.yearSelected(
            (localStorageYear ? financialYears
                .find(financialYear =>
                    financialYear.Year === localStorageYear.Year) : undefined)
            || financialYears
                .find(financialYear => financialYear.Year === companySettings.CurrentAccountingYear));
    }

    private yearSelected(selectedYear: FinancialYear): void {
        this.close();
        this.financialYearService.setActiveYear(selectedYear);
    }

    private close() {
        if (this.dropdowns && this.dropdowns.length) {
            this.dropdowns.forEach((dropdown) => {
                dropdown.close();
            });
        }
        this.companyDropdownActive = false;
    }

    private logOut() {
        this.authService.clearAuthAndGotoLogin();
    }
}
