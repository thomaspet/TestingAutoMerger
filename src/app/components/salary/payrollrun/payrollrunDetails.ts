import { Component, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement, WageType, Account, EmployeeTaxCard,
    CompanySalary, CompanySalaryPaymentInterval, Project, Department, TaxDrawFactor, FinancialYear, EmployeeCategory
} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ControlModal } from './controlModal';
import { PostingsummaryModal } from './postingsummaryModal';
import { VacationpayModal } from './vacationpay/VacationpayModal';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import { IContextMenuItem } from 'unitable-ng2/main';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { SalaryTransactionSelectionList } from '../salarytrans/salarytransactionSelectionList';
import { UniView } from '../../../../framework/core/uniView';
import { PreviewModal } from '../../reports/modals/preview/previewModal';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';
import { IUniSaveAction } from '../../../../framework/save/save';
import 'rxjs/add/observable/forkJoin';
import {
    PayrollrunService, UniCacheService, SalaryTransactionService, EmployeeService, WageTypeService,
    ReportDefinitionService, CompanySalaryService, ProjectService, DepartmentService, EmployeeTaxCardService,
    FinancialYearService, ErrorService, EmployeeCategoryService
} from '../../../services/services';

declare var _;
declare var moment;

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
})

export class PayrollrunDetails extends UniView implements OnDestroy {
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    @ViewChild(ControlModal) private controlModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;
    @ViewChild(VacationpayModal) private vacationPayModal: VacationpayModal;
    @ViewChild(SalaryTransactionSelectionList) private selectionList: SalaryTransactionSelectionList;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;
    private isEditable: boolean;
    private busy: boolean = false;
    private url: string = '/salary/payrollrun/';
    private formIsReady: boolean = false;
    private contextMenuItems: IContextMenuItem[] = [];
    private toolbarconfig: IToolbarConfig;
    private filter: string = '';
    private disableFilter: boolean;
    private saveActions: IUniSaveAction[] = [];
    @ViewChild(PreviewModal) public previewModal: PreviewModal;
    private activeFinancialYear: FinancialYear;

    private employees: Employee[];
    private salaryTransactions: SalaryTransaction[];
    private wagetypes: WageType[];
    private projects: Project[];
    private departments: Department[];
    private detailsActive: Boolean = false;
    private categories: EmployeeCategory[];

    public categoryFilter: any[] = [];
    public tagConfig: any = {
        description: 'Utvalg: ',
        helpText: 'Ansatte i følgende kategorier er med i denne lønnsavregningen:',
        truncate: 20
    };

    constructor(
        private route: ActivatedRoute,
        private payrollrunService: PayrollrunService,
        private router: Router, private tabSer: TabService,
        private _toastService: ToastService,
        protected cacheService: UniCacheService,
        private _salaryTransactionService: SalaryTransactionService,
        private _employeeService: EmployeeService,
        private _wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private _reportDefinitionService: ReportDefinitionService,
        private _companySalaryService: CompanySalaryService,
        private _projectService: ProjectService,
        private _departmentService: DepartmentService,
        private _employeeTaxCardService: EmployeeTaxCardService,
        private _financialYearService: FinancialYearService,
        private employeeCategoryService: EmployeeCategoryService
    ) {
        super(router.url, cacheService);
        this.getLayout();
        this.config = {
            submitText: ''
        };

        this.route.params.subscribe(params => {

            this.payrollrunID = +params['id'];
            super.updateCacheKey(this.router.url);
            this.employees = undefined;
            this.salaryTransactions = undefined;
            this.categoryFilter = [];
            this.categories = [];

            const payrollRunSubject = super.getStateSubject('payrollRun');
            const employeesSubject = super.getStateSubject('employees');

            payrollRunSubject.subscribe((payrollRun: PayrollRun) => {

                this.payrollrun = payrollRun;
                if (this.payrollrun && this.payrollrun.PayDate) {
                    this.payDate = new Date(this.payrollrun.PayDate.toString());
                }
                this.payStatus = this.payrollrunService.getStatus(this.payrollrun).text;

                if (this.formIsReady) {
                    this.setEditMode();
                }

                this.toolbarconfig = {
                    title: this.payrollrun ?
                        (this.payrollrun.Description ?
                            this.payrollrun.Description : 'Lønnsavregning ' + this.payrollrunID)
                        : 'Ny lønnsavregning',
                    subheads: [{
                        title: this.payrollrun ?
                            (this.payrollrun.Description ? 'Lønnsavregning ' + this.payrollrunID : '')
                            : ''
                    },
                    {
                        title: this.payDate ?
                            'Utbetales ' + this.payDate.toLocaleDateString('no',
                                {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                }
                            )
                            : 'Utbetalingsdato ikke satt'
                    },
                    {
                        title: 'Oppsett',
                        classname: this.detailsActive ? 'entityDetails_toggle -is-active' : 'entityDetails_toggle',
                        event: this.toggleDetailsView.bind(this)
                    }],
                    navigation: {
                        prev: this.previousPayrollrun.bind(this),
                        next: this.nextPayrollrun.bind(this),
                        add: this.newPayrollrun.bind(this)
                    },
                };
                this.saveActions = [
                    {
                        label: 'Lagre',
                        action: this.saveAll.bind(this),
                        main: this.payrollrun ? this.payrollrun.StatusCode < 1 : true,
                        disabled: true
                    },
                    {
                        label: 'Kontroller',
                        action: this.openControlModal.bind(this),
                        main: false,
                        disabled: this.payrollrun ? this.payrollrun.StatusCode > 0 : true
                    },
                    {
                        label: 'Avregn',
                        action: this.runSettling.bind(this),
                        main: false,
                        disabled: this.payrollrun ? this.payrollrun.StatusCode > 0 : true
                    },
                    {
                        label: 'Utbetalingsliste',
                        action: this.showPaymentList.bind(this),
                        main: this.payrollrun ? this.payrollrun.StatusCode > 1 : false,
                        disabled: this.payrollrun ? this.payrollrun.StatusCode < 1 : true
                    },
                    {
                        label: 'Bokfør',
                        action: this.openPostingSummaryModal.bind(this),
                        main: this.payrollrun ? this.payrollrun.StatusCode === 1 : false,
                        disabled: this.payrollrun ? this.payrollrun.StatusCode !== 1 : true
                    }
                ];

                this.checkDirty();

            }, err => this.errorService.handle(err));

            employeesSubject
                .subscribe((employees: Employee[]) => {
                    this.employees = employees;
                });

            super.getStateSubject('salaryTransactions').subscribe((salaryTransactions: SalaryTransaction[]) => {
                this.salaryTransactions = salaryTransactions;
                this.checkDirty();
            });

            super.getStateSubject('wagetypes').subscribe((wagetypes) => {
                this.wagetypes = wagetypes;
            });

            super.getStateSubject('projects').subscribe((projects) => {
                this.projects = projects;
            });

            super.getStateSubject('departments').subscribe((departments) => {
                this.departments = departments;
            });

            this.updateTabStrip(this.payrollrunID);
        });

        this.contextMenuItems = [
            {
                label: 'Generer feriepenger',
                action: () => {
                    this.openVacationPayModal();
                }
            },
            {
                label: 'Nullstill lønnsavregning',
                action: () => {
                    if (this.payrollrun) {
                        if (this.payrollrun.StatusCode < 1) {
                            this._toastService.addToast('Kan ikke nullstille', ToastType.warn, 4, 'Lønnsavregningen må være avregnet før du kan nullstille den');
                        } else {
                            if (this.payrollrun.StatusCode < 2 || confirm('Denne lønnsavregningen er bokført, er du sikker på at du vil nullstille?')) {
                                this.busy = true;
                                this.payrollrunService.resetSettling(this.payrollrunID)
                                    .finally(() => this.busy = false)
                                    .subscribe((response: boolean) => {
                                        if (response) {
                                            this.getData();
                                        } else {
                                            this.errorService.handleWithMessage(response, 'Fikk ikke nullstilt lønnsavregning');
                                        }
                                    }, err => this.errorService.handle(err));
                            }
                        }
                    }
                },
                disabled: (rowModel) => {
                    if (this.payrollrun) {
                        return this.payrollrun.StatusCode < 1;
                    } else {
                        return true;
                    }

                }
            }
        ];

        this.router.events.subscribe((event: any) => {
            if (event.constructor.name === 'NavigationEnd') {
                let routeList = event.url.split('/');
                let location = routeList.pop();
                if (!isNaN(+location)) {
                    location = routeList.pop();
                }
                if (location === 'payrollrun' && this.payrollrunID !== undefined) {
                    this.getData();
                }
            }
        });
    }

    public ngOnDestroy() {
        this.payrollrunID = undefined;
    }

    private updateTax(employees: Employee[]) {
        let filter: string = 'filter=';
        let employeeFilterTable: string[] = [];

        this._financialYearService
            .getActiveFinancialYear()
            .switchMap(financialYear => {
                employees.forEach(employee => {
                    employeeFilterTable.push('EmployeeID eq ' + employee.ID);
                });
                filter += '(' + employeeFilterTable.join(' or ') + ') ';
                filter += `and Year le ${financialYear.Year}&orderby=Year DESC`;

                return employeeFilterTable.length
                    ? this._employeeTaxCardService.GetAll(filter)
                    : Observable.of([]);
            })
            .subscribe((taxCards: EmployeeTaxCard[]) => {
                employees.map(employee => {
                    let taxCard = taxCards.find(x => x.EmployeeID === employee.ID);
                    employee.TaxCards = taxCard ? [taxCard] : [];
                });
                super.updateState('employees', employees, false);
            });
    }

    public toggleDetailsView(setValue?: boolean): void {

        if (this.detailsActive && !this.payrollrun.Description) {
            this._toastService.addToast('Beskrivelse mangler',
                ToastType.bad, 3, 'Vi må ha en beskrivelse før vi kan vise lønnspostene');
            return;
        }

        if (setValue !== undefined) {
            this.detailsActive = setValue;
        } else {
            this.detailsActive = !this.detailsActive;
        }

        if (this.payrollrun && !this.detailsActive && this.selectionList) {
            this.selectionList.focusRow();
        }

        let _toolbarconfig = this.toolbarconfig,
            _subhead = _toolbarconfig.subheads[_toolbarconfig.subheads.length - 1];
        if (this.detailsActive) {
            _subhead.classname = 'entityDetails_toggle -is-active';
        } else {
            _subhead.classname = 'entityDetails_toggle';
        }
        this.toolbarconfig = _toolbarconfig;
    }

    public canDeactivate(): Observable<boolean> {

        return Observable
            .of(!super.isDirty())
            .flatMap(result => {
                return result
                    ? Observable.of(result)
                    : Observable
                        .fromPromise(
                        this.confirmModal.confirm(
                            'Du har ulagrede endringer. Ønsker du å lagre disse før du fortsetter?',
                            'Lagre endringer?', true, { accept: 'Lagre', reject: 'Forkast' }))
                        .map((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT) {
                                this.saveAll((m) => { });
                                return true;
                            } else {
                                return response === ConfirmActions.REJECT;
                            }
                        });
            })
            .map(canDeactivate => {
                canDeactivate
                    ? this.cacheService.clearPageCache(this.cacheKey)
                    : this.updateTabStrip(this.payrollrunID);

                return canDeactivate;
            });
    }

    private updateTabStrip(payrollrunID) {
        if (payrollrunID) {
            this.tabSer.addTab({
                name: 'Lønnsavregning ' + payrollrunID,
                url: 'salary/payrollrun/' + payrollrunID,
                moduleID: UniModules.Payrollrun,
                active: true
            });
        } else {
            this.tabSer.addTab({
                name: 'Ny lønnsavregning',
                url: this.url + payrollrunID,
                moduleID: UniModules.Payrollrun,
                active: true
            });
        }
    }

    private getLayout() {
        this.payrollrunService.layout('payrollrunDetailsForm').subscribe(layout => this.fields = layout.Fields);
    }

    private getData() {
        this.getWageTypes();
        this.getSalaryTransactions();
        this.getPayrollRun();
        this.getEmployees();
        this.getEmployeeCategories();
    }

    private getEmployeeCategories() {
        this.payrollrunService.getCategoriesOnRun(this.payrollrunID).subscribe(categories => {
            this.categories = categories;
            this.populateCategoryFilters();
        });
    }

    private getSalaryTransactions() {
        this.getSalaryTransactionsObservable().subscribe((response) => {
            response.map(x => {
                let account = new Account();
                account.AccountNumber = x.Account;
                x['_Account'] = account;
            });
            super.updateState('salaryTransactions', response, false);
        }, err => this.errorService.handle(err));
    }

    private getSalaryTransactionsObservable(): Observable<any> {
        let salaryTransactionFilter = `PayrollRunID eq ${this.payrollrunID}`;
        return Observable.forkJoin(this._salaryTransactionService
            .GetAll(
            'filter=' + salaryTransactionFilter + '&orderBy=IsRecurringPost DESC',
            ['WageType.SupplementaryInformations', 'employment', 'Supplements'
                , 'Dimensions']),
            this.getProjectsObservable(),
            this.getDepartmentsObservable()
        )
            .map((response: [SalaryTransaction[], Project[], Department[]]) => {
                let [transes, projects, departments] = response;
                if (this.selectionList) {
                    this.selectionList.updateSums();
                }

                transes.filter(x => x.DimensionsID).map(trans => {

                    trans['_Department'] = departments ? departments
                        .find(x => x.ID === trans.Dimensions.DepartmentID) : undefined;

                    trans['_Project'] = projects ? projects
                        .find(x => x.ID === trans.Dimensions.ProjectID) : undefined;
                });

                super.updateState('projects', projects, false);
                super.updateState('departments', departments, false);

                return transes;
            });
    }

    private getPayrollRun() {
        if (this.payrollrunID) {
            this.payrollrunService.get(this.payrollrunID).
                subscribe((payroll: PayrollRun) => {
                    this.payrollrun = payroll;
                    if (this.payrollrun) {
                        payroll.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                    }
                    this.updateState('payrollRun', payroll, false);
                }, err => {
                    this.payrollrunID = 0;
                    this._toastService.addToast('Lønnsavregning finnes ikke', ToastType.warn, 5);
                    this.router.navigateByUrl(this.url + 0);
                });
        } else {
            Observable.forkJoin(
                this.payrollrunService.get(this.payrollrunID),
                this.payrollrunService.getLatest(),
                this._companySalaryService.getCompanySalary(),
                this._financialYearService.getActiveFinancialYear()
            ).subscribe((dataSet: any) => {
                let [payroll, last, salaries, activeYear] = dataSet;

                this.payrollrun = payroll;
                this.setDefaults();
                let latest: PayrollRun = last;
                let companysalary: CompanySalary = salaries[0];
                this.activeFinancialYear = activeYear;

                if (this.payrollrun && this.payrollrun.ID === 0) {
                    this.payrollrun.ID = null;
                    this.suggestFromToDates(latest, companysalary);
                }

                if (this.payrollrun) {
                    payroll.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                }

                this.updateState('payrollRun', payroll, false);

            }, err => {
                if (err.status === 404) {
                    this.payrollrunID = 0;
                    this._toastService.addToast('Lønnsavregning finnes ikke, sendes til ny', ToastType.warn, 5);
                    this.router.navigateByUrl(this.url + 0);
                }
                this.errorService.handle(err);
            });
        }
    }

    private setDefaults() {
        this.payrollrun.taxdrawfactor = TaxDrawFactor.Standard;
    }

    private suggestFromToDates(latest: PayrollRun, companysalary: CompanySalary) {
        if (!latest) {
            // First payrollrun for the year
            let todate: Date;
            let fromdate = new Date(this.activeFinancialYear.Year, 0, 1);
            this.payrollrun.FromDate = fromdate;

            switch (companysalary.PaymentInterval) {
                case CompanySalaryPaymentInterval.Pr14Days:
                    todate = new Date(this.activeFinancialYear.Year, 0, 14);
                    this.payrollrun.ToDate = todate;
                    break;

                case CompanySalaryPaymentInterval.Weekly:
                    todate = new Date(this.activeFinancialYear.Year, 0, 7);
                    this.payrollrun.ToDate = todate;
                    break;

                default: // Monthly
                    todate = new Date(this.activeFinancialYear.Year, 0, 31);
                    this.payrollrun.ToDate = todate;
                    break;
            }
        } else {
            let lastTodate = moment(latest.ToDate);
            let lastFromdate = lastTodate.clone();
            lastFromdate.add(1, 'days');
            let fromdateAsDate = new Date(lastFromdate);
            let todateAsDate: Date;

            this.payrollrun.FromDate = fromdateAsDate;

            switch (companysalary.PaymentInterval) {
                case CompanySalaryPaymentInterval.Pr14Days:
                    lastTodate.add(14, 'days');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun.ToDate = todateAsDate;
                    break;

                case CompanySalaryPaymentInterval.Weekly:
                    lastTodate.add(7, 'days');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun.ToDate = todateAsDate;
                    break;

                default:
                    lastTodate = lastFromdate.clone().endOf('month');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun.ToDate = todateAsDate;
                    break;
            }
        }
    }

    private getEmployees() {
        this.payrollrunService
            .getEmployeesOnPayroll(this.payrollrunID,
            ['Employments.Dimensions', 'BusinessRelationInfo', 'SubEntity.BusinessRelationInfo', 'BankAccounts'])
            .subscribe((employees: Employee[]) => {
                this.updateTax(employees);
                this.updateState('employees', employees, false);
            }, err => this.errorService.handle(err));
    }

    private getWageTypes() {
        this._wageTypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
            this.updateState('wagetypes', wagetypes, false);
        });
    }

    private getProjectsObservable() {
        return this.projects ? Observable.of(this.projects) : this._projectService.GetAll('');
    }

    private getDepartmentsObservable() {
        return this.departments ? Observable.of(this.departments) : this._departmentService.GetAll('');
    }

    private checkDirty() {
        if (this.saveActions && this.saveActions.length && this.payrollrun && !this.payrollrun.StatusCode) {
            let saveButton = this.saveActions.find(x => x.label === 'Lagre');
            let calculateButton = this.saveActions.find(x => x.label === 'Avregn');
            if (super.isDirty()) {
                saveButton.disabled = false;
                saveButton.main = true;
                calculateButton.main = false;
            } else {
                saveButton.disabled = true;
                if (saveButton.main) {
                    saveButton.main = false;
                    calculateButton.main = true;
                }
            }
        }
    }

    private getStatustrackConfig() {
        let statuses: string[] = ['Opprettet', 'Avregnet', 'Bokført'];
        let statustrack: UniStatusTrack.IStatus[] = [];
        let activeIndex = statuses.indexOf(this.payStatus);

        statuses.forEach((status, i) => {
            let _state: UniStatusTrack.States;

            if (i > activeIndex) {
                _state = UniStatusTrack.States.Future;
            } else if (i < activeIndex) {
                _state = UniStatusTrack.States.Completed;
            } else if (i === activeIndex) {
                _state = UniStatusTrack.States.Active;
            }

            statustrack[i] = {
                title: status,
                state: _state
            };
        });
        return statustrack;
    }

    public newPayrollrun() {

        this.canDeactivate().subscribe(result => {
            if (result) {
                this.payrollrunService.get(0).subscribe((payrollrun: PayrollRun) => {
                    this.payrollrun = payrollrun;
                    this.payrollrunID = 0;
                    this.payDate = null;
                    this.router.navigateByUrl(this.url + this.payrollrun.ID);
                    this.toggleDetailsView(true);
                },
                    err => this.errorService.handle(err));
            }
        });
    }

    public openPostingSummaryModal(done) {
        this.postingSummaryModal.openModal();
        done('');
    }

    public openControlModal(done) {
        this.controlModal.openModal();
        done('');
    }

    public openVacationPayModal() {
        this.vacationPayModal.openModal();
    }

    public canPost(): boolean {
        if (this.payrollrun) {
            if (this.payrollrun.StatusCode === 1) {
                return true;
            }
        }
        return false;
    }

    public previousPayrollrun() {
        this.canDeactivate().subscribe(result => {
            if (result) {
                this.payrollrunService.getPrevious(this.payrollrunID)
                    .subscribe((previous) => {
                        if (previous) {
                            this.payrollrun = previous;
                            this.router.navigateByUrl(this.url + previous.ID);
                        }
                    }, err => this.errorService.handle(err));
            }
        });
    }

    public nextPayrollrun() {

        if (!this.canDeactivate()) {
            return;
        }

        this.payrollrunService.getNext(this.payrollrunID)
            .subscribe((next) => {
                if (next) {
                    this.payrollrun = next;
                    this.router.navigateByUrl(this.url + next.ID);
                }
            }, err => this.errorService.handle(err));
    }

    public runSettling(done: (message: string) => void) {
        this.payrollrunService.runSettling(this.payrollrunID)
            .finally(() => this.busy = false)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                    done('Avregnet');
                }
            },
            (err) => {
                done('Feil ved avregning');
                this.errorService.handle(err);
                this.checkDirty();
            });
    }

    public showPaymentList(done) {
        this._reportDefinitionService.getReportByName('Utbetalingsliste').subscribe((report) => {
            this.previewModal.openWithId(report, this.payrollrun.ID, 'RunID');
            done('');
        });
    }

    public resetSettling() {
        this.payrollrunService.resetSettling(this.payrollrunID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                }
            },
            err => this.errorService.handle(err));
    }

    private findByProperty(name) {
        return this.fields.find((fld) => fld.Property === name);
    }

    private setEditMode() {
        var idField: UniFieldLayout;
        if (this.payrollrun) {
            if (this.payrollrun.StatusCode > 0) {
                this.isEditable = false;
                this.uniform.readMode();
            } else {
                this.isEditable = true;
                this.uniform.editMode();
                idField = this.findByProperty('ID');

                if (this.payrollrunID === 0) {
                    idField.ReadOnly = false;
                } else {
                    idField.ReadOnly = true;
                }
            }
        } else {
            this.isEditable = true;
            this.uniform.editMode();
            idField = this.findByProperty('ID');
            idField.ReadOnly = true;
        }
        var recurringTransCheck: UniFieldLayout = this.findByProperty('ExcludeRecurringPosts');
        var noNegativePayCheck: UniFieldLayout = this.findByProperty('1');
        if (this.isEditable) {
            recurringTransCheck.ReadOnly = false;
            noNegativePayCheck.ReadOnly = false;
        } else {
            recurringTransCheck.ReadOnly = true;
            noNegativePayCheck.ReadOnly = true;
        }
        this.fields = _.cloneDeep(this.fields);
    }

    public ready(value) {
        this.setEditMode();
        this.formIsReady = true;
    }

    private saveAll(done: (message: string) => void) {

        if (!this.payrollrun.PayDate) {
            this._toastService
                .addToast('Utbetalingsdato mangler', ToastType.bad, 3, 'Du må angi utbetalingsdato før du kan lagre');
            this.uniform.field('PayDate').focus();
            done('');
            return;
        }

        this.setEditableOnChildren(false);

        this.savePayrollrun()
            .flatMap((payrollRun: PayrollRun) => {

                this.payrollrun = payrollRun;
                super.updateState('payrollRun', this.payrollrun, false);

                if (!this.payrollrunID) {
                    this.router.navigateByUrl(this.url + this.payrollrun.ID);
                }

                return this.getSalaryTransactionsObservable();

            })
            .finally(() => this.setEditableOnChildren(true))
            .subscribe((salaryTransactions: SalaryTransaction[]) => {

                salaryTransactions.map(x => {
                    let account = new Account();
                    account.AccountNumber = x.Account;
                    x['_Account'] = account;
                });

                super.updateState('salaryTransactions', salaryTransactions, false);

                done('Lagret');
            },
            (err) => {
                done('Feil ved lagring');
                this.errorService.handle(err);
            });
    }

    private change(value) {
        super.updateState('payrollRun', this.payrollrun, true);
    }

    private populateCategoryFilters() {
        this.categoryFilter = [];
        this.categories.map(x => this.categoryFilter.push({ id: x.ID, title: x.Name }));
    }

    private setEditableOnChildren(isEditable: boolean) {
        if (this.selectionList) {
            this.selectionList.setEditable(isEditable);
        }
    }

    public savePayrollrun(): Observable<PayrollRun> {
        let retObs = null;
        if (!this.payrollrun.ID) {
            this.payrollrun.ID = 0;
        }

        if (this.payrollrun.ID > 0) {
            this.payrollrun.transactions = _.cloneDeep(this.salaryTransactions
                .filter(x => x['_isDirty'] || x.Deleted));
            this.payrollrun.transactions.map((trans: SalaryTransaction) => {
                if (!trans.Deleted) {
                    if (!trans.ID) {
                        trans['_createguid'] = this._salaryTransactionService.getNewGuid();
                    }
                    if (trans.Supplements) {
                        trans.Supplements
                            .filter(x => !x.ID)
                            .forEach((supplement: SalaryTransactionSupplement) => {
                                supplement['_createguid'] = this._salaryTransactionService.getNewGuid();
                            });
                    }
                    if (!trans.DimensionsID && trans.Dimensions) {
                        if (Object.keys(trans.Dimensions)
                            .filter(x => x.indexOf('ID') > -1)
                            .some(key => trans.Dimensions[key])) {
                            trans.Dimensions['_createguid'] = this._salaryTransactionService.getNewGuid();
                        } else {
                            trans.Dimensions = null;
                        }
                    }
                }
                trans.Wagetype = null;
                trans.Employee = null;
                return trans;
            });
            retObs = this.payrollrunService.Put(this.payrollrun.ID, this.payrollrun);
        } else {
            retObs = this.payrollrunService.Post(this.payrollrun);
        }

        return retObs;
    }

    public updatePayrollRun() {
        this.getPayrollRun();
    }

    public updateTranses() {
        this.busy = true;
        this.savePayrollrun()
            .finally(() => this.busy = false)
            .subscribe(response => {
                this.getSalaryTransactions();
            },
            (err) => {
                this.errorService.handle(err);
            }
            );
    }

    public filterChange(tags: any[]) {
        let filter = tags.filter(x => !x.id).map(x => `Name eq '${x.title}'`).join(' or ');
        let categoryObs = filter ? this.employeeCategoryService.GetAll('filter=' + filter) : Observable.of([]);

        categoryObs.switchMap((response: EmployeeCategory[]) => {
            let categoriesToDelete = this.categories
                .filter(x => !tags.some(y => y.id === x.ID))
                .map(x => x.ID);

            let categoriesToAdd = response;
            let saveObs: Observable<any>[] = categoriesToAdd
                .map(x => this.payrollrunService
                    .saveCategoryOnRun(this.payrollrunID, x)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs)))
                .concat(categoriesToDelete
                    .map(x => this.payrollrunService
                        .deleteCategoryOnRun(this.payrollrunID, x)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))));

            return saveObs.length ? Observable.forkJoin(saveObs) : Observable.of(null);
        })
            .subscribe(
            x => x,
            err => this.errorService.handle(err),
            () => {
                this.getEmployeeCategories();
                this.getEmployees();
                this.getSalaryTransactions();
            });
        console.info('The tags changed: ', tags);
    }
}
