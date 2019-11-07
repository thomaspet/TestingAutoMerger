import {Component, ViewChildren, QueryList, ChangeDetectorRef, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {CompanySettings, FinancialYear, Company} from '@app/unientities';
import {UniSelect, ISelectConfig} from '@uni-framework/ui/uniform';
import {UniModalService, UniConfirmModalV2, ConfirmActions} from '@uni-framework/uni-modal';
import {AuthService} from '@app/authService';
import {
    CompanySettingsService,
    CompanyService,
    FinancialYearService,
    AltinnAuthenticationService,
    ErrorService
} from '@app/services/services';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';

import {YearModal, IChangeYear} from './yearModal';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {TabService} from '@app/components/layout/navbar/tabstrip/tabService';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'uni-company-dropdown',
    templateUrl: './companyDropdown.html'
})
export class UniCompanyDropdown {
    private LAST_ASKED_CHANGE_YEAR_LOCALSTORAGE_KEY: string = 'lastAskedChangeYear';

    @ViewChildren(UniSelect)
    private dropdowns: QueryList<UniSelect>;

    @Input()
    lockYearSelector: boolean = false;

    public activeCompany: any;
    public companyDropdownActive: Boolean;
    public companySettings: CompanySettings;

    public selectYear: string[];
    public activeYear: number;

    public availableCompanies;
    public selectCompanyConfig: ISelectConfig;
    public selectYearConfig: ISelectConfig;

    private financialYears: Array<FinancialYear> = [];
    public isCreatingNewYear: boolean = false;

    onDestroy$ = new Subject();

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
        private modalService: UniModalService,
        private toastService: ToastService,
        private browserStorage: BrowserStorageService,
    ) {
        this.authService.authentication$.subscribe(() => {
            this.companyService.GetAll(null).pipe(
                takeUntil(this.onDestroy$)
            ).subscribe(
                res => this.availableCompanies = res,
                err => console.error(err)
            );
        });

        this.activeCompany = this.browserStorage.getItem('activeCompany');
        this.companyDropdownActive = false;

        this.selectCompanyConfig = {
            hideDeleteButton: true,
            template: (company: Company) => {
                return company.IsTemplate ? 'MAL - ' + company.Name : company.Name;
            }
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

        const currentYear = this.financialYearService.getActiveYear();
        this.selectYear = this.getYearComboSelection(currentYear);
        this.activeYear = currentYear;

        this.financialYearService.lastSelectedFinancialYear$
            .subscribe(res => {
                const previousSelectedYear = this.activeYear;
                const newSelectedYear = res.Year;

                const found = this.financialYears.find(v => v.Year.toString() === newSelectedYear.toString());
                if (found && this.activeYear && found.Year !== this.activeYear) {
                    this.selectYear = this.getYearComboSelection(newSelectedYear);
                    this.activeYear = newSelectedYear;
                } else if (!found) {
                    this.financialYearService.GetAll(null)
                        .subscribe(years => {
                            // refresh years before checking if this is actually a new year, someone
                            // else might have created it already after you logged in (or it may have been
                            // automatically created when booking a journalentry)
                            this.financialYears = years;
                            const foundSecondAttempt = this.financialYears.find(v => v.Year.toString() === newSelectedYear.toString());

                            if (foundSecondAttempt && this.activeYear
                                && foundSecondAttempt.Year.toString() !== this.activeYear.toString()) {
                                this.selectYear = this.getYearComboSelection(newSelectedYear);
                                this.activeYear = newSelectedYear;
                            } else if (!foundSecondAttempt) {
                                this.promptToCreateNewYear(newSelectedYear, previousSelectedYear);
                            }
                        });
                }
            },
            err => {
                this.errorService.handle(err);
            });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    public promptToCreateNewYear(newSelectedYear: number, previousSelectedYear: number) {
        // add simple validation, max 5 years back, 2 years ahead
        const currentDateYear = new Date().getFullYear();
        if (newSelectedYear > currentDateYear + 2 || newSelectedYear < currentDateYear - 5) {
            this.toastService.addToast(
                'Ugyldig år valgt',
                ToastType.bad,
                ToastTime.medium,
                'Kan ikke velge et nytt regnskapsår som er mer enn 2 år frem i tid, eller 5 år tilbake i tid'
            );
            return;
        }

        const modal = this.modalService.open(UniConfirmModalV2, {
            header: `Opprett nytt regnskapsår for ${newSelectedYear}?`,
            message: 'Du har valgt et år som ikke er opprett enda, vil du opprette dette året?',
            buttonLabels: {
                accept: 'Opprett nytt regnskapsår',
                cancel: 'Avbryt'
            }
        });

        modal.onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                this.isCreatingNewYear  = true;

                this.toastService.addToast(
                    'Oppretter nytt regnskapsår...',
                    ToastType.good,
                    ToastTime.long,
                    'Dette kan ta litt tid, vennligst vent'
                );

                this.financialYearService.createFinancialYear(newSelectedYear)
                    .subscribe(newYear => {
                        this.financialYears.push(newYear);

                        this.financialYearService.setActiveYear(newYear);

                        this.selectYear = this.getYearComboSelection(newSelectedYear);
                        this.activeYear = newSelectedYear;

                        this.yearIsSelected(newYear.Year.toString());

                        this.toastService.clear();
                        this.toastService.addToast(
                            `Regnskapsår ${newSelectedYear} opprettet!`,
                            ToastType.good,
                            ToastTime.short
                        );

                        this.isCreatingNewYear = false;
                    }, err => {
                        this.errorService.handle(err);
                        this.isCreatingNewYear = false;
                    });
                } else {
                    if (previousSelectedYear !== newSelectedYear) {
                        this.selectYear = this.getYearComboSelection(previousSelectedYear);
                        this.activeYear = previousSelectedYear;

                        const resetFinancialYear = new FinancialYear();
                        resetFinancialYear.Year = previousSelectedYear;
                        this.financialYearService.setActiveYear(resetFinancialYear);
                    } else {
                        const sortedYears = this.financialYears.sort((a, b) => a.Year > b.Year ? -1 : 1);
                        const lastYear = sortedYears.length > 0 ? sortedYears[0] : null;

                        if (lastYear) {
                            this.selectYear = this.getYearComboSelection(lastYear.Year);
                            this.activeYear = lastYear.Year;

                            this.financialYearService.setActiveYear(lastYear);
                        }
                    }
                }
            });
    }

    public openYearModal()  {
        this.modalService.open(
            YearModal, { data: { year: this.activeYear }}
        ).onClose.subscribe((val: IChangeYear) => {
            if (val && val.year && (typeof val.year === 'number')) {
                const found = this.financialYears.find(v => v.Year === val.year);
                if (found) {
                    this.financialYearService.setActiveYear(found);
                } else {
                    // set a new dummy year based on the value - this will trigger an event from
                    // this.financialYearService.lastSelectedFinancialYear$ which will validate and
                    // create the actual year if it does not exist already
                    const fin = new FinancialYear();
                    fin.Year = val.year;
                    this.yearSelected(fin, true);
                }

                this.close();
            }
        },
        (err) => {
            this.errorService.handle('Error setting year');
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
                this.selectDefaultYear(this.financialYears);

                this.cdr.markForCheck(); // not sure where this should be
            },
            err => this.errorService.handle(err)
            );
    }

    public companySelected(selectedCompany): void {
        this.close();
        if (selectedCompany && selectedCompany !== this.activeCompany) {
            // Trigger change detection on dropdown with previously active company.
            // This is done because unsaved changes might stop the process of
            // changing company. If company is changed successfully the class
            // variable (and dropdown) will be updated with the new company.
            this.activeCompany = Object.assign({}, this.activeCompany);

            this.authService.setActiveCompany(selectedCompany);
        }
    }

    private selectDefaultYear(financialYears: FinancialYear[]): void {
        let selYr = this.financialYearService.getActiveYear();

        const currentYear = new Date().getFullYear();

        if (!selYr) {
            selYr = currentYear;
        }

        const localStorageYear = this.financialYearService.getYearInLocalStorage();

        if (localStorageYear) {
            this.yearSelected(localStorageYear, false);
        } else {
            let financialYear = financialYears.find(finyear => finyear.Year === selYr);
            if (financialYear) {
                this.yearSelected(financialYear, false);
            } else {
                // we havent created a new year yet for some reason, select the
                // previous year - most likely we will ask if the user wants to
                // select a new year right after
                const sortedYears = this.financialYears.sort((a, b) => a.Year > b.Year ? -1 : 1);
                const lastYear = sortedYears.length > 0 ? sortedYears[0] : null;
                if (lastYear) {
                    financialYear = lastYear;
                    selYr = lastYear.Year;
                    this.yearSelected(financialYear, false);
                }
            }

            if (!financialYear) {
                financialYear = new FinancialYear();
                financialYear.Year = selYr;
                this.yearSelected(financialYear, false);
            }
        }

        if (selYr && selYr + 1 === currentYear) {
            // if year is not current year, check if user has been asked to
            // use a new year previously
            const lastAskedChangeYear = this.browserStorage.getItemFromCompany(this.LAST_ASKED_CHANGE_YEAR_LOCALSTORAGE_KEY);

            if (!lastAskedChangeYear || lastAskedChangeYear < currentYear) {
                // save info that the user has been asked to switch year
                this.browserStorage.setItemOnCompany(this.LAST_ASKED_CHANGE_YEAR_LOCALSTORAGE_KEY, currentYear);

                const modal = this.modalService.open(UniConfirmModalV2, {
                    header: `Vil du bytte regnskapsår til ${currentYear}?`,
                    message: 'Du kan senere endre hvilket regnskapsår du vil jobbe med i menyen oppe til høyre',
                    buttonLabels: {
                        accept: 'Ja, bytt regnskapsår',
                        cancel: `Nei, behold ${selYr}`
                    }
                });

                modal.onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        const fin = new FinancialYear();
                        fin.Year = currentYear;
                        this.yearSelected(fin, false);
                    }
                });
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
            let financialYear = this.financialYears.find(val => val.Year === year);
            const currentYear = this.financialYearService.getActiveYear();
            if (financialYear && financialYear.Year !== currentYear) {
                this.yearSelected(financialYear, true);
            } else {
                financialYear = new FinancialYear();
                financialYear.Year = year;
                this.yearSelected(financialYear, true);
            }

            this.close();
        } else {
            this.openYearModal();
        }
    }

    private yearSelected(selectedYear: FinancialYear, setManual: boolean): void {
        const localStorageYear = this.financialYearService.getYearInLocalStorage();

        this.selectYear = this.getYearComboSelection(selectedYear.Year);

        this.activeYear = selectedYear.Year;

        if (setManual) {
            const currentYear = new Date().getFullYear();

            if (selectedYear.Year.toString() < currentYear.toString()) {
                // save info that the user has manually set a year prior to this year,
                // not point in asking them if they want to switch to current year on next
                // logon if so
                this.browserStorage.setItemOnCompany(this.LAST_ASKED_CHANGE_YEAR_LOCALSTORAGE_KEY, currentYear);
            }
        }

        if (!localStorageYear || (localStorageYear && selectedYear.Year !== localStorageYear.Year)) {
            this.financialYearService.setActiveYear(selectedYear);
        }

        // needed when switching year after changing company
        this.cdr.markForCheck();

        this.close();
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
