import {Component, ViewChildren, QueryList, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {CompanySettings, FinancialYear, User} from '@app/unientities';
import {UniSelect, ISelectConfig} from '@uni-framework/ui/uniform';
import {UniModalService} from '@uni-framework/uni-modal';
import {AuthService} from '@app/authService';
import {
    CompanySettingsService,
    CompanyService,
    FinancialYearService,
    AltinnAuthenticationService,
    ErrorService,
    YearService
} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

import {YearModal, IChangeYear} from './yearModal';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {TabService} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-company-dropdown',
    templateUrl: './companyDropdown.html'
})
export class UniCompanyDropdown {
    @ViewChildren(UniSelect)
    private dropdowns: QueryList<UniSelect>;

    public activeCompany: any;
    public companyDropdownActive: Boolean;
    public companySettings: CompanySettings;

    public selectYear: string[];
    public activeYear: number;

    public availableCompanies: Observable<any>;
    public selectCompanyConfig: ISelectConfig;
    public selectYearConfig: ISelectConfig;

    private financialYears: Array<FinancialYear> = [];

    constructor(
        private altInnService: AltinnAuthenticationService,
        private router: Router,
        private tabservice: TabService,
        private authService: AuthService,
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

            // Trigger change detection on dropdown with previously active company.
            // This is done because unsaved changes might stop the process of
            // changing company. If company is changed successfully the class
            // variable (and dropdown) will be updated with the new company.
            this.activeCompany = Object.assign({}, this.activeCompany);

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

    public close() {
        if (this.dropdowns && this.dropdowns.length) {
            this.dropdowns.forEach((dropdown) => {
                dropdown.close();
            });
        }
        this.companyDropdownActive = false;
    }
}
