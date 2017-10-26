﻿import {Component, ViewChildren, QueryList, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {CompanySettings, FinancialYear, User} from '../../../../../unientities';
import {UniSelect, ISelectConfig} from '../../../../../../framework/ui/uniform/index';
import {UniModalService} from '../../../../../../framework/uniModal/barrel';
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

import {YearModal, ChangeYear} from './modals/yearModal';

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

                    <ng-template [ngIf]="currentUser?.License?.ContractType?.TypeName">
                        <dt>Lisens</dt>
                        <dd>{{currentUser.License.ContractType.TypeName}}</dd>
                    </ng-template>

                    <ng-template [ngIf]="currentUser?.License?.UserType?.TypeName">
                        <dt>Rolle</dt>
                        <dd>{{currentUser.License.UserType.TypeName}}</dd>
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
                        (valueChange)="yearIsSelected($event)">
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

    private selectYear: string[];
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
        private cdr: ChangeDetectorRef,
        private yearService: YearService,
        private modalService: UniModalService
    ) {
        this.userService.getCurrentUser().subscribe((user: User) => {
            this.currentUser = user;
        }, err => this.errorService.handle(err));

        this.companyService.GetAll(null).subscribe(
            res => this.availableCompanies = res,
            err => this.errorService.handle(err)
        );

        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.companyDropdownActive = false;

        this.selectCompanyConfig = {
            displayProperty: 'Name'
        };

        this.selectYearConfig = {
            template: (item) => typeof item === 'number' ? item.toString() : item,
            searchable: false
        };

        this.loadCompanyData();
        this.authService.authentication$.subscribe(auth => {
            if (auth && auth.user) {
                this.activeCompany = auth.activeCompany;
                this.loadCompanyData();
                this.cdr.markForCheck();
            }
        });

        this.yearService.selectedYear$.subscribe(val => {
            this.selectYear = this.getYearComboSelection(val);
            this.activeYear = val;
        });
    }

    public openYearModal()  {
        this.modalService.open(YearModal, { data: { year: this.activeYear }}).onClose.subscribe((val: ChangeYear) => {
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
                if (val.checkStandard) {
                    this.companySettingsService.Get(1).subscribe((res) => {
                        res.CurrentAccountingYear = this.activeYear;
                    });
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
        if (!selYr){
            if (companySettings){
                selYr = companySettings.CurrentAccountingYear;
            }

            if (!selYr){
                selYr = new Date().getFullYear();
            }
        }
        let localStorageYear = this.financialYearService.getYearInLocalStorage();

        if (localStorageYear)
        {
            if (selYr !== localStorageYear.Year)  {
                let fin = financialYears.find(finyear => finyear.Year === selYr);
                if (fin){
                    this.yearSelected(fin);
                }else {
                    fin = new FinancialYear();
                    fin.Year = selYr;
                    this.yearSelected(fin);
                }
            } else {
            this.yearSelected(localStorageYear);
            }
        } else {
                let fin = financialYears.find(finyear => finyear.Year == selYr);
                if (fin){
                    this.yearSelected(fin);
                }else {
                    fin = new FinancialYear();
                    fin.Year = selYr;
                    this.yearSelected(fin);
                }
        }
    }

    private yearIsSelected(selYear: string): void{
        let yr = parseInt(selYear);
        if (yr) {
            this.yearService.setSelectedYear(yr);
            let found = this.financialYears.find(val => val.Year === yr);
            if (found) {
                this.financialYearService.setActiveYear(found);
                this.close();
            } else {
                let finY = new FinancialYear();
                finY.Year = yr;
                this.yearSelected(finY);
            }
        } else {
            this.openYearModal();
        }

    }


    private yearSelected(selectedYear: FinancialYear): void {
        this.close();
        this.financialYearService.setActiveYear(selectedYear);
        this.yearService.setSelectedYear(selectedYear.Year);
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
