import {Component, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl} from '@angular/forms';
import {
    Employee, AGAZone, SalaryTransactionSums,
    PayrollRun, EmployeeTaxCard, SalBalType, ValidationLevel, EmployeeCategory, Employment, SubEntity,
} from '../../../unientities';
import {ISummaryConfig} from '../../common/summary/summary';
import {UniView} from '../../../../framework/core/uniView';
import {SalaryTransactionEmployeeList} from './salarytransList';
import {ILinkMenuItem} from '../../common/linkMenu/linkMenu';
import {ReplaySubject, Observable, Subject, of, forkJoin} from 'rxjs';
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
    PageStateService,
    IEmployee,
    Dimension
} from '../../../services/services';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import PerfectScrollbar from 'perfect-scrollbar';

import * as _ from 'lodash';
import {takeUntil, map, tap, switchMap, filter, take, finalize} from 'rxjs/operators';

import {SalaryHelperMethods} from '../helperMethods/salaryHelperMethods';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
const PAYROLL_RUN_KEY: string = 'payrollRun';
const SELECTED_EMP_KEY: string = 'selected_emp';
const CATEGORIES_KEY: string = 'categories';
const EMPLOYMENTS_KEY: string = 'employments';
const REFRESH_SUMS_KEY: string = 'refresh_sums';
const SUB_ENTITIES_KEY: string = 'sub_entities';
const REFRESH_TAX: string = 'refresh_tax';
const EMP_COUNT: string = 'employee_count';
const REFRESH_EMPS_ACTION: string = 'refresh_emps_action';

interface IEmpListFilter {
    name: string;
    value: string;
    multiplier: number;
    initialMulitplier: number;
    index: number;
}

@Component({
    selector: 'salarytrans',
    templateUrl: './salarytransactionSelectionList.html',
    styleUrls: ['salarytransactionSelectionList.sass']
})

export class SalaryTransactionSelectionList extends UniView implements OnDestroy, AfterViewInit {
    public selectedEmp: IEmployee;
    public errors: {[id: number]: string} = {};
    searchControl: FormControl = new FormControl('');
    employeeFilterString: string = '';
    employees: any[] = [];
    filteredEmployees: IEmployee[] = [];
    scrollbar: PerfectScrollbar;
    employeeIDFromParams: number = 0;
    hasInitialized: boolean = false;
    @ViewChild(CdkVirtualScrollViewport, { static: true }) viewport: CdkVirtualScrollViewport;
    public standardEmployeeListfilters: IEmpListFilter[] = [
        { name: 'Ansattnummer', value: 'EmployeeNumber', multiplier: 1, initialMulitplier: 1, index: 0 },
        { name: 'Navn', value: 'Name', multiplier: 1, initialMulitplier: 1, index: 1 },
        { name: 'Har feil', value: '_errors', multiplier: -1, initialMulitplier: 1, index: 2 }
    ];
    public employeeListfilters: IEmpListFilter[] = [...this.standardEmployeeListfilters.map(x => ({...x}))];
    public currentListFilter: IEmpListFilter; // = this.employeeListfilters[0];

    private employments: Employment[] = [];
    private taxCards: {[empID: number]: EmployeeTaxCard} = {};
    public agaZone: AGAZone;
    public summary: ISummaryConfig[] = [];
    public linkMenu$: ReplaySubject<ILinkMenuItem[]>;
    private payrollRunID: number;
    private payrollRun: PayrollRun;
    private destroy$: Subject<any> = new Subject();
    private cancel$: Subject<any> = new Subject();
    private categories: EmployeeCategory[];
    public busy: boolean;

    @ViewChild(SalaryTransactionEmployeeList, { static: false })
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
            this.errors = {};
            this.payrollRunID = +param['id'];
            this.getEmployeeData(this.payrollRunID)

            if (!this.payrollRunID)  {
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
        super.getStateSubject(REFRESH_EMPS_ACTION)
            .takeUntil(this.destroy$)
            .subscribe(() => this.getEmployeeData(this.payrollRunID));
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
                        tap(() => this.taxCards = {})
                    )
                    .subscribe(() => this.updateErrors(this.employees));
    }

    public ngOnInit() {
        this.searchControl.valueChanges
            .debounceTime(150)
            .pipe(
                takeUntil(this.destroy$),
            )
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
            name: 'SALARY.PAYROLL.NUMBER~' + this.payrollRunID,
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Payrollrun,
            active: true
        });
    }

    public onActiveFilterChange(f: IEmpListFilter) {
        this.currentListFilter = f;

        this.filteredEmployees = this.getFilteredEmployees();
        f.initialMulitplier *= -1;

        this.employeeListfilters = [
            ...this.standardEmployeeListfilters.filter(x => x.index < f.index).map(x => ({...x})),
            f,
            ...this.standardEmployeeListfilters.filter(x => x.index > f.index).map(x => ({...x})),
        ];
        // Scroll to top when changing sort-value
        document.getElementById('role-info').scrollTop = 0;
        this.scrollbar.update();

        this.addTab();
    }

    private compare(propName, rev) {
        return (a: IEmployee, b: IEmployee) => {
            let propA = this.getPropValue(propName, a);
            let propB = this.getPropValue(propName, b);
            if (typeof propA === 'string') {
                propA = propA && propA.toLowerCase();
                propB = propB && propB.toLowerCase();
            }
            return propA === propB ? 0 : propA < propB ? (-1 * rev) : (1 * rev);
        };
    }

    private getPropValue(name: string, emp: IEmployee) {
        if (name === '_errors') {
            return this.errors[emp.ID] ? 1 : 0;
        }
        return emp[name];
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

    public getEmployeeData(payRunID: number) {
        if (!payRunID) {return;}

        this.busy = true;
        let query = `model=SalaryTransaction&expand=Employee.BusinessRelationInfo&join=SalaryTransaction.EmployeeID eq ` +
        `EmployeeCategoryLink.EmployeeID as CatLink&filter=PayrollRunID eq ${this.payrollRunID}`;
        query += `&select=${this.createEmpSelect()}`;
        this.statisticsService.GetAllUnwrapped(query).subscribe(res => {
            // Return if no employees on the payrollrun!
            if (!res.length) {
                this.hasInitialized = true;
                this.busy = false;
                this.employees = [];
                this.filteredEmployees = [];
                return;
            }
            this.getEmploymentsForEmps(res).subscribe();
            this.formatEmployees(res);
        });
    }

    public formatEmployees(employees: IEmployee[]) {
        super.updateState(EMP_COUNT, employees.length, false);
        this.updateErrors(employees);
        this.fillInSubEntities(employees)
            .pipe(
                finalize(() => this.busy = false),
            ).subscribe(emps => {
            this.employees = emps;
            this.filteredEmployees = this.getFilteredEmployees();

            let index = this.filteredEmployees.findIndex(emp => emp.ID === this.employeeIDFromParams);
            index = index > -1 ? index : 0;

            const initial = this.filteredEmployees.length ? this.filteredEmployees[index] : this.employees[index];
            super.updateState(SELECTED_EMP_KEY, initial, false);
            this.addTab();
            this.hasInitialized = true;

            setTimeout(() => {
                this.viewport.scrollToIndex(index);
            });
        });
    }

    public getFilteredEmployees() {
        return this.employees
        .filter((emp: IEmployee) => {
            if (emp.Name.toLowerCase().includes(this.employeeFilterString.toLowerCase()) ||
                emp.EmployeeNumber.toString().toLowerCase().startsWith(this.employeeFilterString.toLowerCase())) {
                return emp;
            }
        })
        .sort(this.compare(
            this.currentListFilter.value,
            this.currentListFilter.multiplier * this.currentListFilter.initialMulitplier)
        );
    }

    private createEmpSelect(run?: PayrollRun): string {
        return 'EmployeeID as ID,EmployeeNumber as EmployeeNumber,'
        + 'BusinessRelationInfo.Name as Name,'
        + 'BusinessRelationInfo.DefaultBankAccountID as DefaultBankAccountID,'
        + 'Employee.SocialSecurityNumber as SocialSecurityNumber,'
        + 'Employee.SubEntityID as SubEntityID,'
        + 'sum(Sum) as Sum'; // this is here because only having distinct doesn't work here for some reason.
    }

    private getEmploymentsForEmps(emps: IEmployee[]) {
        this.employments = [];
        return this.addEmploymentsForEmps(emps);
    }

    private addEmploymentsForEmps(emps: IEmployee[]) {
        if (!emps.length) {
            return of([]);
        }
        return forkJoin(this.helperMethods
                .odataFilters(emps.map(x => x.ID), 'EmployeeID')
                .map(empFilter => this.statisticsService.GetAllUnwrapped(
                    `model=Employment&` +
                    `select=ID as ID,EmployeeID as EmployeeID,JobName as JobName,Standard as Standard,` +
                    `Dimensions.DepartmentID as DepartmentID,Dimensions.ProjectID as ProjectID,DimensionsID as DimensionsID&` +
                    `expand=Dimensions&` +
                    `filter=${empFilter}`
            )))
            .pipe(
                map((pagedEmployments: any[][]) => pagedEmployments.map(empls => this.createEmployments(empls))),
                map(pagedEmployments => pagedEmployments.reduce((acc, curr) => [...acc, ...curr], [])),
                tap(empl => this.updateState(EMPLOYMENTS_KEY, [...(this.employments || []), ...empl], false))
            );
    }

    private createEmployments(emps: any[]): Employment[] {
        return emps.map(emp => this.createEmployment(emp));
    }

    private createEmployment(emp: any): Employment {
        const ret: Employment = emp;
        if (emp['DepartmentID'] || emp['ProjectID']) {
            ret.Dimensions = <Dimension>{};
            ret.Dimensions.ID = emp['DimensionsID'];
            ret.Dimensions.DepartmentID = emp['DepartmentID'];
            ret.Dimensions.ProjectID = emp['ProjectID'];
        }
        return ret;
    }

    private updateErrors(employees: IEmployee[]) {
        this.fillInTaxCards(employees)
            .pipe(
                tap(emps => emps.forEach(emp => {
                    const error = this.generateEmployeeError(emp);
                    if (!error) {
                        return;
                    }
                    this.errors[emp.ID] = error;
                })),
                tap(() => this.linkMenu$.next(this.generateLinkMenu(this.payrollRun, this.selectedEmp))),
            )
            .subscribe();
    }

    private fillInTaxCards(emps: IEmployee[]): Observable<IEmployee[]> {
        if (!this.fillInTaxCardsFromCache(emps).some(e => !e.TaxCards)) {
            return of(emps);
        }
        const year = this.financialYearService.getActiveYear();

        return forkJoin(this.helperMethods
            .odataFilters(emps.filter(e => !e.TaxCards).map(e => e.ID), 'EmployeeID')
            .map(empFilter =>  this.taxCardService
                .GetAll(`filter=${empFilter} and`
                    + ` year le ${year}&orderby=year DESC&expand=${this.taxCardService.taxExpands()}`)
            ))
            .pipe(
                map((taxCards: EmployeeTaxCard[][]) => taxCards.reduce((acc, curr) => [...acc, ...curr], [])),
                map((taxCards) => {
                    const distinctCards: {[empID: number]: EmployeeTaxCard} = {};
                    taxCards.forEach(card => {
                        if (distinctCards[card.EmployeeID]) {
                            return;
                        }
                        distinctCards[card.EmployeeID] = card;
                    });
                    return distinctCards;
                }),
                tap(taxCards => Object.keys(taxCards).forEach(key => this.taxCards[key] = taxCards[key])),
                map(() => this.taxCards),
                map(taxCards => emps.map(emp => {
                    const cards = [];
                    if (taxCards[emp.ID]) {
                        cards.push(taxCards[emp.ID]);
                    }
                    emp.TaxCards = cards;
                    return emp;
                })),
            );
    }

    private fillInTaxCardsFromCache(emps: IEmployee[]): IEmployee[] {
        emps.forEach(emp => {
            if (emp.TaxCards) {
                return;
            }
            const card = this.taxCards[emp.ID];
            if (!card) {
                return;
            }
            emp.TaxCards = [card];
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
            data: {  employees: this.employees, categories: this.categories, runID: this.payrollRunID },
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
            if (this.errors[employee.ID]) {
                items.unshift(
                    {label: this.errors[employee.ID], link: this.createEmployeeLink(employee.ID), validation: ValidationLevel.Error}
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
        this.viewport.scrollToIndex(prev);
    }

    public nextRow() {
        const next = this.filteredEmployees.findIndex(x => x.ID === this.selectedEmp.ID) + 1;
        if (!this.filteredEmployees[next]) {
            return;
        }
        this.markSelected(this.filteredEmployees[next]);
        this.viewport.scrollToIndex(next);
    }

    private markSelected(row) {
        if (!row || (this.selectedEmp && this.selectedEmp.ID === row.ID)) {
            return;
        }
        super.updateState(SELECTED_EMP_KEY, row, false);
        this.addTab();
    }

    private getAga(employee: IEmployee) {
        if (employee.SubEntity.AgaZone) {
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
