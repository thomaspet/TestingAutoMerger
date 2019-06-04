import {Component, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {FormControl} from '@angular/forms';
import {
    Employee, AGAZone, SalaryTransactionSums,
    PayrollRun, EmployeeTaxCard, SalBalType, ValidationLevel, EmployeeCategory, Employment, SubEntity,
} from '../../../unientities';
import {ISummaryConfig} from '../../common/summary/summary';
import {UniView} from '../../../../framework/core/uniView';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {ILinkMenuItem} from '../../common/linkMenu/linkMenu';
import {ReplaySubject, Observable, Subject, of} from 'rxjs';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniFindEmployeeModal} from './findEmployeeModal';
import {
    UniModalService
} from '@uni-framework/uni-modal';
import {
    UniCacheService,
    AgaZoneService,
    NumberFormat,
    ErrorService,
    SalarySumsService,
    EmployeeTaxCardService,
    FinancialYearService,
    StatisticsService,
    EmploymentService,
    PageStateService
} from '../../../services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import PerfectScrollbar from 'perfect-scrollbar';

import * as _ from 'lodash';
import {takeUntil, map, tap, switchMap, filter, take, finalize} from 'rxjs/operators';

import {SalaryHelperMethods} from '../helperMethods/salaryHelperMethods';
const PAYROLL_RUN_KEY: string = 'payrollRun';
const SELECTED_EMP_KEY: string = 'selected_emp';
const CATEGORIES_KEY: string = 'categories';
const EMPLOYMENTS_KEY: string = 'employments';
const REFRESH_SUMS_KEY: string = 'refresh_sums';
const SUB_ENTITIES_KEY: string = 'sub_entities';
const TAX_CARDS_KEY: string = 'tax_cards';
const REFRESH_TAX: string = 'refresh_tax';

export interface IEmployee {
    _errors: string;
    Name: string;
    ID: number;
    CategoryIDs: number[];
    TaxCards: EmployeeTaxCard[];
    BusinessRelationID: number;
    DefaultBankAccountID: number;
    SocialSecurityNumber: string;
    Employments: Employment[];
    SubEntity: SubEntity;
    SubEntityID: number;
    EmployeeNumber: number;
}

@Component({
    selector: 'salarytrans',
    templateUrl: './salarytransactionSelectionList.html'
})

export class SalaryTransactionSelectionList extends UniView implements OnDestroy, AfterViewInit {
    public selectedEmp: IEmployee;
    searchControl: FormControl = new FormControl('');
    employeeFilterString: string = '';
    employees: any[] = [];
    filteredEmployees: any[] = [];
    scrollbar: PerfectScrollbar;
    employeeIDFromParams: number = 0;
    hasInitialized: boolean = false;

    employeeListfilters = [
        { name: 'Ansattnummer', value: 'EmployeeNumber', multiplier: 1, initialMulitplier: 1, index: 0 },
        { name: 'Navn', value: 'Name', multiplier: 1, initialMulitplier: 1, index: 1 },
        { name: 'Har feil', value: '_errors', multiplier: -1, initialMulitplier: 1, index: 2 }
    ];
    currentListFilter; // = this.employeeListfilters[0];

    private employments: Employment[] = [];
    private taxCards: EmployeeTaxCard[] = [];
    public agaZone: AGAZone;
    public summary: ISummaryConfig[] = [];
    public linkMenu$: ReplaySubject<ILinkMenuItem[]>;
    private payrollRunID: number;
    private payrollRun: PayrollRun;
    private destroy$: Subject<any> = new Subject();
    private cancel$: Subject<any> = new Subject();
    private categories: EmployeeCategory[];
    public busy: boolean;

    @ViewChild(SalaryTransactionEmployeeList)
    private transList: SalaryTransactionEmployeeList;

    constructor(
        private _agaZoneService: AgaZoneService,
        private _salarySumsService: SalarySumsService,
        private numberFormat: NumberFormat,
        private route: ActivatedRoute,
        private router: Router,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private toastService: ToastService,
        private taxCardService: EmployeeTaxCardService,
        private financialYearService: FinancialYearService,
        private statisticsService: StatisticsService,
        private helperMethods: SalaryHelperMethods,
        private employmentService: EmploymentService,
        private pageStateService: PageStateService,
        private tabService: TabService,
        private modalService: UniModalService
    ) {
        super(router.url, cacheService);

        this.linkMenu$ = new ReplaySubject<ILinkMenuItem[]>(1);
        this.route.queryParams.subscribe(queryParams => {
            this.employeeIDFromParams = +queryParams['employee'] || 0;
            this.employeeFilterString = queryParams['search'] || '';
            this.currentListFilter = this.employeeListfilters[+queryParams['order'] || 0];
        });
        this.route.params.subscribe(param => {
            this.payrollRunID = +param['id'];
            if (this.payrollRunID) {
                this.getEmployeeData();
            } else {
                this.employees = [];
                this.filteredEmployees = [];
                this.selectedEmp = null;
                this.hasInitialized = false;
            }

            this.setupState(this.router.url);

        });
    }

    private setupState(key: string) {
        super.updateCacheKey(key);
        super.getStateSubject(SELECTED_EMP_KEY)
                    .pipe(
                        takeUntil(this.destroy$),
                        filter((emp: IEmployee) => emp.ID !== (this.selectedEmp && this.selectedEmp.ID)),
                        switchMap(emp => {
                            return this.getStateSubject(EMPLOYMENTS_KEY)
                                .pipe(
                                    take(1),
                                    map((employments: Employment[]) => {
                                        emp.Employments = employments.filter(e => e.EmployeeID === emp.ID);
                                        return emp;
                                    })
                                );
                        }),
                        tap((emp: IEmployee) => this.selectedEmp = emp),
                        tap(emp => this.handleAgaAndSumsOnEmp(emp)),
                        tap(() => super.updateState(REFRESH_SUMS_KEY, true, false)),
                        tap(emp => this.linkMenu$.next(this.generateLinkMenu(this.payrollRun, emp))),
                    )
                    .subscribe();

                // Get employments
                super.getStateSubject(EMPLOYMENTS_KEY).pipe(takeUntil(this.destroy$))
                    .subscribe(emps => this.employments = emps);

                // Get tax cards
                super.getStateSubject(TAX_CARDS_KEY).pipe(takeUntil(this.destroy$))
                    .subscribe(cards => this.taxCards = cards);

                // Get payrollrun
                super.getStateSubject(PAYROLL_RUN_KEY)
                    .pipe(
                        takeUntil(this.destroy$),
                        tap(payrollRun => this.linkMenu$.next(this.generateLinkMenu(payrollRun, this.selectedEmp))),
                    )
                    .subscribe((payrollRun: PayrollRun) => this.payrollRun = payrollRun);

                // Get categories
                super.getStateSubject(CATEGORIES_KEY).pipe(takeUntil(this.destroy$))
                    .subscribe(cats => this.categories = cats);

                super.getStateSubject(REFRESH_SUMS_KEY).pipe(takeUntil(this.destroy$))
                    .subscribe(() => this.setSummarySource());

                super.getStateSubject(REFRESH_TAX)
                    .pipe(
                        takeUntil(this.destroy$),
                        tap(() => this.taxCards = [])
                    )
                    .subscribe(() => this.fillInTaxCards(this.employees || []));
    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredEmployees = this.getFilteredEmployees();
                setTimeout(() => {
                    this.scrollbar.update();
                    this.addTab();
                });
            });
    }

    public ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#role-info');
    }

    public ngOnDestroy() {
        this.destroy$.next();
        this.cancel$.next();
    }

    public addTab() {
        this.pageStateService.setPageState('employee', this.selectedEmp ? this.selectedEmp.ID + '' : '');
        this.pageStateService.setPageState('search', this.employeeFilterString);
        this.pageStateService.setPageState('order', this.currentListFilter.index + '');

        this.tabService.addTab({
            name: 'Lønnsavregning. ' + this.payrollRunID,
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Payrollrun,
            active: true
        });
    }

    public onActiveFilterChange(f) {
        this.currentListFilter = f;
        this.filteredEmployees = this.getFilteredEmployees();

        f.initialMulitplier *= -1;

        // Scroll to top when changing sort-value
        document.getElementById('role-info').scrollTop = 0;
        this.scrollbar.update();

        this.addTab();
    }

    private compare(propName, rev) {
        return (a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? (-1 * rev) : (1 * rev);
    }

    private fillInSubEntities(emps: IEmployee[]) {
        return super.getStateSubject(SUB_ENTITIES_KEY)
            .pipe(
                take(1),
                map((subs: SubEntity[]) => {
                    emps.forEach(emp => emp.SubEntity = subs.find(sub => sub.ID === emp.SubEntityID));
                    return emps;
                })
            );
    }

    public getEmployeeData() {
        this.busy = true;
        let query = `model=SalaryTransaction&expand=Employee.BusinessRelationInfo&join=SalaryTransaction.EmployeeID eq ` +
        `EmployeeCategoryLink.EmployeeID as CatLink&filter=PayrollRunID eq ${this.payrollRunID}`;
        query += `&select=${this.createEmpSelect()}`;
        this.statisticsService.GetAllUnwrapped(query).subscribe(res => {
            // Return if no employees on the payrollrun!
            if (!res.length) {
                this.hasInitialized = true;
                this.busy = false;
                return;
            }
            this.getEmployments(res);
            this.formatEmployees(res);
        });
    }

    public formatEmployees(res: any[]) {
        this.fillInErrors(res)
            .pipe(
                switchMap(res2 => this.fillInSubEntities(res2)),
                finalize(() => this.busy = false),
            ).subscribe(res3 => {
            this.employees = res3;
            this.filteredEmployees = this.getFilteredEmployees();

            let index = this.filteredEmployees.findIndex(emp => emp.ID === this.employeeIDFromParams);
            index = index > -1 ? index : 0;

            const initial = this.filteredEmployees.length ? this.filteredEmployees[index] : this.employees[index];
            super.updateState(SELECTED_EMP_KEY, initial, false);
            this.addTab();
            this.hasInitialized = true;

            setTimeout(() => {
                const list = document.getElementById('role-info');
                const listElement = list.getElementsByClassName('selected')[0];
                if (list && listElement) {
                    list.scrollTop = listElement['offsetTop'];
                }
            });
        });
    }

    public getFilteredEmployees() {
        return this.employees.sort(this.compare(
            this.currentListFilter.value,
            this.currentListFilter.multiplier * this.currentListFilter.initialMulitplier)
        ).filter((emp: IEmployee) => {
            if (emp.Name.toLowerCase().includes(this.employeeFilterString.toLowerCase()) ||
                emp.EmployeeNumber.toString().toLowerCase().startsWith(this.employeeFilterString.toLowerCase())) {
                return emp;
            }
        })
        .slice(0, 100);
    }

    private createEmpSelect(run?: PayrollRun): string {
        // if (!run.StatusCode) {
        //     return 'ID as ID,EmployeeNumber as EmployeeNumber,'
        //     + 'BusinessRelationInfo.Name as Name,'
        //     + 'BusinessRelationInfo.DefaultBankAccountID as DefaultBankAccountID,'
        //     + 'SocialSecurityNumber as SocialSecurityNumber,'
        //     + 'SubEntityID as SubEntityID,'
        //     + 'count(EmployeeNumber) as count';
        // }
        return 'EmployeeID as ID,EmployeeNumber as EmployeeNumber,'
        + 'BusinessRelationInfo.Name as Name,'
        + 'BusinessRelationInfo.DefaultBankAccountID as DefaultBankAccountID,'
        + 'Employee.SocialSecurityNumber as SocialSecurityNumber,'
        + 'Employee.SubEntityID as SubEntityID,'
        + 'sum(Sum) as Sum'; // this is here because only having distinct doesn't work here for some reason.
    }

    private createEmpFilter(run: PayrollRun, cats: EmployeeCategory[], params: URLSearchParams): string {
        let query = this.handleEmpSearch(params.get('filter'), run) || '';
        if (run.StatusCode) {
            query += `${query ? ' and ' : ''}PayrollRunID eq ${run.ID}`;
        }
        const catFilter = this.categoryFilter(cats);
        if (catFilter) {
            query = `${(query && `${query} and `)}${catFilter}`;
        }
        return query;
    }

    private createEmpJoin(run: PayrollRun) {
        return  `${!run.StatusCode ? 'Employee.ID' : 'SalaryTransaction.EmployeeID'} eq EmployeeCategoryLink.EmployeeID as CatLink`;
    }

    private createEmpExpand(run: PayrollRun) {
        return !run.StatusCode
            ? 'BusinessRelationInfo'
            : 'Employee.BusinessRelationInfo';
    }

    private getEmployments(emps: IEmployee[]) {
        if (!emps.length) {
            return;
        }
        this.employmentService
            .GetAll(`filter=${this.helperMethods.odataFilter(emps.map(x => x.ID), 'EmployeeID')}`)
            .subscribe(employments => super.updateState(EMPLOYMENTS_KEY, employments, false));
    }

    private addEmploymentsForEmps(emps: IEmployee[]) {
        if (!emps.length) {
            return;
        }
        return this.employmentService
            .GetAll(`filter=${this.helperMethods.odataFilter(emps.map(x => x.ID), 'EmployeeID')}`)
            .pipe(
                tap(empl => this.updateState(EMPLOYMENTS_KEY, [...this.employments, ...empl], false))
            );
    }

    private handleEmpSearch(search: string, run: PayrollRun) {
        if (!search) {
            return search;
        }
        return search.replace('Name', !run.StatusCode ? 'BusinessRelationInfo.Name' : 'Employee.BusinessRelationInfo.Name');
    }

    private categoryFilter(cats: EmployeeCategory[]) {
        if (!cats.length) {
            return '';
        }
        return this.helperMethods.odataFilter(cats.map(cat => cat.ID), 'CatLink.EmployeeCategoryID');
    }

    private fillInErrors(employees: IEmployee[]) {
        return this.fillInTaxCards(employees)
            .pipe(
                map(emps => emps.map(emp => {
                    emp['_errors'] = this.generateEmployeeError(emp);
                    return emp;
                }))
            );
    }

    private fillInTaxCards(emps: IEmployee[]): Observable<IEmployee[]> {
        if (!this.fillInTaxCardsFromCache(emps).some(e => !e.TaxCards)) {
            return of(emps);
        }
        const year = this.financialYearService.getActiveYear();
        return this.taxCardService
            .GetAll(`filter=${this.helperMethods.odataFilter(emps.filter(e => !e.TaxCards).map(e => e.ID), 'EmployeeID')} and`
                + ` year le ${year}&orderby=year DESC&expand=${this.taxCardService.taxExpands()}`)
            .pipe(
                map((taxCards: EmployeeTaxCard[]) =>
                    taxCards.filter((card, i, self) => self.map(x => x.EmployeeID).indexOf(card.EmployeeID) === i)),
                tap(taxCards => super.updateState(TAX_CARDS_KEY, [...this.taxCards, ...taxCards], false)),
                map(taxCards => emps.map(emp => {
                    emp.TaxCards = taxCards.filter(t => t.EmployeeID === emp.ID);
                    return emp;
                }))
            );
    }

    private fillInTaxCardsFromCache(emps: IEmployee[]): IEmployee[] {
        emps.forEach(emp => {
            if (emp.TaxCards) {
                return;
            }
            const cards = this.taxCards.filter(card => card.EmployeeID === emp.ID);
            if (!cards.length) {
                return;
            }
            emp.TaxCards = cards;
        });
        return emps;
    }

    private handleAgaAndSumsOnEmp(emp: IEmployee) {
        if (!emp) {
            return;
        }
        this.getAga(emp);
    }

    public getEmployee() {
        this.modalService.open(UniFindEmployeeModal, {
            data: {  employees: this.employees },
            closeOnClickOutside: false
        }).onClose.subscribe((value) => {
            this.employeeFilterString = '';
            if (value) {
                this.employeeIDFromParams = value.id;
                this.addEmploymentsForEmps(value.items)
                    .subscribe(() => this.formatEmployees(value.items));
            }
        });
    }

    private generateLinkMenu(payrollRun: PayrollRun, employee: IEmployee): ILinkMenuItem[] {
        let items: ILinkMenuItem[] = [];
        if (employee) {
            items = [
                ...items,
                {label: 'Forskudd', link: this.createNewAdvanceLink(employee.ID)},
                {label: 'Trekk', link: this.createNewDrawLink(employee.ID)},
                {label: 'Saldooversikt', link: this.createSalaryBalanceListLink(employee.ID)}
            ];
            if (employee._errors) {
                items.unshift(
                    {label: employee._errors, link: this.createEmployeeLink(employee.ID), validation: ValidationLevel.Error}
                );
            }
        }

        if (payrollRun) {
            if (payrollRun.StatusCode > 0) {
                items.push({label: 'Tilleggsopplysninger', link: this.createSupplementsLink(payrollRun.ID)});
            }
        }

        return items;
    }

    private generateEmployeeError(employee: IEmployee): string {
        const taxError = !employee.TaxCards ||
            !this.taxCardService
                .hasTaxCard(employee.TaxCards[0], this.payrollRun && new Date(this.payrollRun.PayDate).getFullYear());

        const accountError = !employee.DefaultBankAccountID;

        const socialSecurityNumber = !employee.SocialSecurityNumber;

        const errors: string[] = [];
        if (taxError) {
            errors.push('Skatteinfo');
        }
        if (accountError) {
            errors.push((errors.length ? 'k' : 'K') + 'ontonummer');
        }
        if (socialSecurityNumber) {
            errors.push((errors.length ? 'f' : 'F') + 'ødselsnummer');
        }
        const lastEntry = errors.pop() || '';
        if (!lastEntry) {
            return '';
        }

        return (errors.length ? errors.join(', ') + ' og ' + lastEntry : lastEntry) + ' mangler';
    }



    public rowSelected(row: IEmployee) {
        this.markSelected(row);
    }

    public prevRow() {
        const prev = this.filteredEmployees.findIndex(x => x.ID === this.selectedEmp.ID) - 1;
        if (!this.filteredEmployees[prev]) {
            return;
        }
        this.markSelected(this.filteredEmployees[prev]);
    }

    public nextRow() {
        const next = this.filteredEmployees.findIndex(x => x.ID === this.selectedEmp.ID) + 1;
        if (!this.filteredEmployees[next]) {
            return;
        }
        this.markSelected(this.filteredEmployees[next]);
    }

    private markSelected(row) {
        if (!row || (this.selectedEmp && this.selectedEmp.ID === row.ID)) {
            return;
        }
        super.updateState(SELECTED_EMP_KEY, row, false);
        this.addTab();
    }

    private getAga(employee: IEmployee) {
        if (employee.SubEntity.AgaZone > 0) {
            const obs = !this.agaZone || (employee.SubEntity.AgaZone !== this.agaZone.ID)
                ? this._agaZoneService
                    .Get(employee.SubEntity.AgaZone)
                    .catch((err, errObs) => this.errorService.handleRxCatch(err, errObs))
                : Observable.of(this.agaZone);

            obs.subscribe((agaResponse: AGAZone) => {
                this.agaZone = agaResponse;
            });
        } else {
            if (!employee.SubEntity.AgaZone) {
                this.toastService.addToast('Arbeidsgiveravgift', ToastType.warn, ToastTime.medium,
                'Kunne ikke finne sone for arbeidsgiveravgift på den ansatte, sjekk innstillingene');
            }
            this.agaZone = new AGAZone();
        }
    }

    private setSums(employeeTotals: SalaryTransactionSums, employee = this.selectedEmp) {

        const taxCard = employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
        super.getStateSubject(PAYROLL_RUN_KEY)
            .take(1)
            .map((run: PayrollRun) => this.taxCardService.getTaxCardPercentAndTable(taxCard, new Date(run.PayDate).getFullYear()))
            .subscribe(taxCardInfo => {
                this.summary = [
                {
                    title: 'Grunnlag AGA',
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.baseAGA)
                },
                {
                    title: 'Gr.lag feriepenger',
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.baseVacation)
                },
                {
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.tableTax),
                    title: 'Tabelltrekk ' + taxCardInfo.table,
                    description: employeeTotals
                        && employeeTotals.baseTableTax
                        ? `av ${this.numberFormat.asMoney(employeeTotals.baseTableTax)}` : null
                },
                {
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.percentTax),
                    title: `Prosenttrekk ` + taxCardInfo.percent,
                    description: employeeTotals
                        && employeeTotals.basePercentTax
                        ? `av ${this.numberFormat.asMoney(employeeTotals.basePercentTax)}` : null
                },
                {
                    title: 'Utbetalt beløp',
                    value: employeeTotals && this.numberFormat.asMoney(employeeTotals.netPayment)
                }];
            });
    }

    private setSummarySource(emp = this.selectedEmp) {
        if (this.payrollRunID > 0 && emp) {
            this.cancel$.next();
            this._salarySumsService
                .getFromPayrollRun(this.payrollRunID, `EmployeeID eq ${emp.ID}`)
                .pipe(
                    takeUntil(this.cancel$)
                )
                .debounceTime(200)
                .subscribe(
                employeeTotals => this.setSums(employeeTotals),
                err => this.errorService.handle(err));
        }
    }

    private getTaxcard(employee: Employee): EmployeeTaxCard {
        return employee && employee.TaxCards && employee.TaxCards.length ? employee.TaxCards[0] : undefined;
    }

    public hasDirty(): boolean {
        return this.transList ? this.transList.hasDirty() : false;
    }

    public setEditable(isEditable: boolean) {
        if (this.transList) {
            this.transList.setEditable(isEditable);
        }
    }

    private createNewDrawLink(employeeID: number) {
        return `#/salary/salarybalances/0/details;employeeID=${employeeID}`;
    }
    private createNewAdvanceLink(employeeID: number) {
        return `#/salary/salarybalances/0/details;employeeID=${employeeID};instalmentType=${SalBalType.Advance}`;
    }
    private createSalaryBalanceListLink(employeeID: number) {
        return `#/salary/salarybalances;empID=${employeeID}`;
    }
    private createSupplementsLink(payrollRunID: number) {
        return `#/salary/supplements;runID=${payrollRunID}`;
    }
    private createEmployeeLink(employeeID: number) {
        return `#/salary/employees/${employeeID}`;
    }
}
