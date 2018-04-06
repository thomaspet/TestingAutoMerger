import {Component, ViewChildren, QueryList, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {CompanySettings, FinancialYear, User} from '../../../../../unientities';
import {UniSelect, ISelectConfig} from '../../../../../../framework/ui/uniform/index';
import {UniModalService} from '../../../../../../framework/uni-modal';
import {AuthService} from '../../../../../authService';
import {
    CompanySettingsService,
    CompanyService,
    FinancialYearService,
    AltinnAuthenticationService,
    UserService,
    ErrorService,
    YearService
} from '../../../../../services/services';
import {ToastService, ToastType} from '../../../../../../framework/uniToast/toastService';

import {YearModal, IChangeYear} from './modals/yearModal';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {TabService} from '@app/components/layout/navbar/tabstrip/tabService';

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

                <h2> {{currentUser?.DisplayName}} </h2>

                <dl>
                    <uni-select *ngIf="availableCompanies"
                        class="navbar_company_select"
                        [config]="selectCompanyConfig"
                        [items]="availableCompanies"
                        [value]="activeCompany"
                        (valueChange)="companySelected($event)">
                    </uni-select>

                    <ng-template [ngIf]="licenseRole">
                        <dt>Lisens</dt>
                        <dd>{{licenseRole}}</dd>
                    </ng-template>

                    <dt *ngIf="companySettings?.OrganizationNumber">Org.nr</dt>
                    <dd *ngIf="companySettings?.OrganizationNumber" itemprop="taxID">
                        {{companySettings.OrganizationNumber | uninumberformat:'orgno'}}
                    </dd>

                    <dt *ngIf="companySettings?.DefaultPhone?.Number">Telefon</dt>
                    <dd itemprop="phone" *ngIf="companySettings?.DefaultPhone?.Number">
                        <a href="tel:{{companySettings.DefaultPhone.Number}}">
                            {{companySettings.DefaultPhone.Number}}
                        </a>
                    </dd>
                </dl>

                <p class="navbar_company_taxyear">Regnskapsår
                    <uni-select class="navbar_company_taxyearselect"
                        [config]="selectYearConfig"
                        [items]="selectYear"
                        [value]="activeYear"
                        (valueChange)="onYearDropdownChange($event)">
                    </uni-select>
                </p>

                <p>
                    <a routerLink="settings/company" class="navbar_company_settings" (click)="close()">
                        Innstillinger
                    </a>
                    <button (click)="logOut()" class="navbar_company_logout">Logg ut</button>
                </p>

            </section>
        </article>
    `
})
export class UniCompanyDropdown {
    @ViewChildren(UniSelect)
    private dropdowns: QueryList<UniSelect>;

    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private companySettings: CompanySettings;

    private currentUser: User;
    private licenseRole: string;

    private selectYear: string[];
    private financialYears: Array<FinancialYear> = [];
    private activeYear: number;

    private availableCompanies: Observable<any>;
    private selectCompanyConfig: ISelectConfig;
    private selectYearConfig: ISelectConfig;

    constructor(
        private altInnService: AltinnAuthenticationService,
        private router: Router,
        private tabservice: TabService,
        private authService: AuthService,
        private userService: UserService,
        private companySettingsService: CompanySettingsService,
        private companyService: CompanyService,
        private financialYearService: FinancialYearService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        private yearService: YearService,
        private modalService: UniModalService,
        private toastService: ToastService,
        private browserStorage: BrowserStorageService,
    ) {
        this.userService.getCurrentUser().subscribe((user: User) => {
            this.currentUser = user;

            const licenseRoles: string[] = [];
            if (user['License'] && user['License'].ContractType) {
                if (user['License'].ContractType.TypeName) {
                    licenseRoles.push(user['License'].ContractType.TypeName);
                }
            }
            if (user['License'] && user['License'].UserType) {
                if (user['License'].UserType.TypeName) {
                    licenseRoles.push(user['License'].UserType.TypeName);
                }
            }
            this.licenseRole = licenseRoles.join('/');
        }, err => this.errorService.handle(err));

        this.companyService.GetAll(null).subscribe(
            res => this.availableCompanies = res,
            err => this.errorService.handle(err)
        );

        this.activeCompany = this.browserStorage.getItem('activeCompany');
        this.companyDropdownActive = false;

        this.selectCompanyConfig = {
            displayProperty: 'Name',
            hideDeleteButton: true
        };

        this.selectYearConfig = {
            template: (item) => typeof item === 'number' ? item.toString() : item,
            searchable: false,
            hideDeleteButton: true
        };

        this.loadCompanyData();
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.activeCompany = auth.activeCompany;
                this.loadCompanyData();
                this.cdr.markForCheck();
            }
        },
        err => this.errorService.handle(err));

        this.yearService.selectedYear$
            .subscribe(val => {
                this.selectYear = this.getYearComboSelection(val);
                this.activeYear = val;
            },
            err => this.errorService.handle(err));

        this.financialYearService.lastSelectedFinancialYear$
            .subscribe(res => {
                let found = this.financialYears.find(v => v.Year === res.Year);
                if (found && this.activeYear && found.Year !== this.activeYear) {
                    return this.yearIsSelected(found.Year.toString());
                }
            },
            err => this.errorService.handle(err));
    }

    public openYearModal()  {
        this.modalService.open(
            YearModal, { data: { year: this.activeYear }}
        ).onClose.subscribe((val: IChangeYear) => {
            if (val && val.year && (typeof val.year === 'number')) {
                this.yearService.setSelectedYear(val.year);
                let found = this.financialYears.find(v => v.Year === val.year);
                if (found) {
                    this.financialYearService.setActiveYear(found);
                } else {
                    let fin = new FinancialYear();
                    fin.Year = val.year;
                    this.financialYearService.setActiveYear(fin);
                }

                if (found && val.checkStandard) {
                    this.companySettings.CurrentAccountingYear = val.year;
                    this.companySettingsService.Put(this.companySettings.ID, this.companySettings)
                        .subscribe(
                            res => res,
                            err => this.errorService.handle(err)
                        );
                } else if (!found && val.checkStandard) {
                    this.toastService.addToast(
                        'Kan ikke endre standard',
                         ToastType.warn,
                         5,
                         'Regnskapsår eksisterer ikke. Endret kun nåværende sesjon.'
                    );
                }
                this.close();
            }   else {
                this.yearService.setSelectedYear(this.activeYear);
            }
        },
        (err) => {
            this.yearService.setSelectedYear(this.activeYear);
        });
    }

    private loadCompanyData() {
        this.altInnService.clearAltinnAuthenticationDataFromLocalstorage();
        this.loadYears();
    }

    private getYearComboSelection(curYear): string[]     {
        return [
            `${curYear - 1}`,
            `${curYear + 1}`,
            '...'];
    }

    private loadYears() {
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

    public companySelected(selectedCompany): void {
        this.close();
        if (selectedCompany && selectedCompany !== this.activeCompany) {
            this.yearService.clearActiveYear();
            this.authService.setActiveCompany(selectedCompany);
        }
    }

    private selectDefaultYear(financialYears: FinancialYear[], companySettings: CompanySettings): void {
        let selYr = this.yearService.getSavedYear();

        if (companySettings) {
            selYr = companySettings.CurrentAccountingYear;
        }

        if (!selYr) {
            selYr = new Date().getFullYear();
        }

        let localStorageYear = this.financialYearService.getYearInLocalStorage();
        if (localStorageYear) {
            if (selYr !== localStorageYear.Year)  {
                let fin = financialYears.find(finyear => finyear.Year === selYr);
                if (fin) {
                    this.yearSelected(fin);
                } else {
                    fin = new FinancialYear();
                    fin.Year = selYr;
                    this.yearSelected(fin);
                }
            } else {
                this.yearSelected(localStorageYear);
            }
        } else {
            let fin = financialYears.find(finyear => finyear.Year === selYr);
            if (fin) {
                this.yearSelected(fin);
            } else {
                fin = new FinancialYear();
                fin.Year = selYr;
                this.yearSelected(fin);
            }
        }
    }

    public onYearDropdownChange(year: string) {
        this.tabservice.removeAllTabs();
        this.router.navigateByUrl('/');

        this.yearIsSelected(year);
    }

    private yearIsSelected(selYear: string): void {
        const year = parseInt(selYear, 10);
        if (year) {
            this.yearService.setSelectedYear(year);
            let financialYear = this.financialYears.find(val => val.Year === year);
            if (financialYear) {
                this.financialYearService.setActiveYear(financialYear);
                this.close();
            } else {
                financialYear = new FinancialYear();
                financialYear.Year = year;
                this.yearSelected(financialYear);
            }
        } else {
            this.openYearModal();
        }
    }

    private yearSelected(selectedYear: FinancialYear): void {
        const localStorageYear = this.financialYearService.getYearInLocalStorage();

        if (localStorageYear && selectedYear.Year !== localStorageYear.Year) {
            this.financialYearService.setActiveYear(selectedYear);
            this.yearService.setSelectedYear(selectedYear.Year);
            this.close();
        }

    }

    private close() {
        if (this.dropdowns && this.dropdowns.length) {
            this.dropdowns.forEach((dropdown) => {
                dropdown.close();
            });
        }
        this.companyDropdownActive = false;
    }

    public logOut() {
        this.authService.clearAuthAndGotoLogin();
    }
}
