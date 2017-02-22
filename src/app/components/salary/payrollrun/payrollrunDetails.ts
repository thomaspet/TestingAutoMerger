import { Component, ViewChild, OnDestroy, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement, WageType, Account, EmployeeTaxCard,
    CompanySalary, CompanySalaryPaymentInterval, Project, Department, TaxDrawFactor, FinancialYear, EmployeeCategory,
    JournalEntry
} from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ControlModal } from './controlModal';
import { PostingsummaryModal } from './postingsummaryModal';
import { VacationpayModal } from './vacationpay/VacationpayModal';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import { IContextMenuItem } from 'unitable-ng2/main';
import { IToolbarConfig } from '../../common/toolbar/toolbar';
import { UniStatusTrack } from '../../common/toolbar/statustrack';
import { ToastService, ToastType, ToastTime } from '../../../../framework/uniToast/toastService';
import { SalaryTransactionSelectionList } from '../salarytrans/salarytransactionSelectionList';
import { UniView } from '../../../../framework/core/uniView';
import { PreviewModal } from '../../reports/modals/preview/previewModal';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';
import { IUniSaveAction } from '../../../../framework/save/save';
import 'rxjs/add/observable/forkJoin';
import {
    PayrollrunService, UniCacheService, SalaryTransactionService, EmployeeService, WageTypeService,
    ReportDefinitionService, CompanySalaryService, ProjectService, DepartmentService, EmployeeTaxCardService,
    FinancialYearService, ErrorService, EmployeeCategoryService, SalarySumsService, NumberFormat, FileService,
    JournalEntryService
} from '../../../services/services';
import { IPosterWidget } from '../../common/poster/poster';

declare var _;
declare var moment;

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
})

export class PayrollrunDetails extends UniView implements OnDestroy {
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    @ViewChild(UniForm) public uniform: UniForm;
    private payrollrun$: BehaviorSubject<PayrollRun> = new BehaviorSubject(undefined);
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
    private detailsActive: boolean = false;
    private categories: EmployeeCategory[];
    private changedPayroll: boolean;
    private journalEntry: JournalEntry;

    public categoryFilter: any[] = [];
    public tagConfig: any = {
        description: 'Utvalg ',
        helpText: 'Ansatte i følgende kategorier er med i denne lønnsavregningen:',
        truncate: 20
    };

    private payrollrunWidgets: IPosterWidget[] = [
        {
            type: 'table',
            config: {
                rows: [{
                    cells: [{
                        text: ''
                    }]
                }]
            }
        },
        {
            type: 'text',
            config: {
                mainText: { text: '' }
            }
        },
        {
            type: 'alerts',
            config: {
                alerts: [{
                    text: '',
                    class: ''
                },
                {
                    text: '',
                    class: ''
                }]
            }
        },
        {
            type: 'text',
            config: {
                mainText: { text: '' }
            }
        }
    ];

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
        private employeeCategoryService: EmployeeCategoryService,
        private _salarySumsService: SalarySumsService,
        private numberformat: NumberFormat,
        private fileService: FileService,
        private journalEntryService: JournalEntryService
    ) {
        super(router.url, cacheService);
        this.getLayout();
        this.config$.next({
            submitText: ''
        });

        this.route.params.subscribe(params => {
            this.journalEntry = undefined;
            this.changedPayroll = true;
            this.payrollrunID = +params['id'];
            this.tagConfig.readOnly = !this.payrollrunID;
            if (!this.payrollrunID) {
                this.setEditableOnChildren(false);
            }
            super.updateCacheKey(this.router.url);
            this.employees = undefined;
            this.salaryTransactions = undefined;
            this.categoryFilter = [];
            this.categories = [];

            const payrollRunSubject = super.getStateSubject('payrollRun');
            const employeesSubject = super.getStateSubject('employees');

            payrollRunSubject
                .do((payrollRun: PayrollRun) => {
                    if (!this.journalEntry && payrollRun.JournalEntryNumber) {
                        this.journalEntryService
                            .GetAll(`filter=journalEntryNumber eq '${payrollRun.JournalEntryNumber}'&top=1`)
                            .map(x => x[0])
                            .subscribe((journalEntry: JournalEntry) => this.journalEntry = journalEntry,
                            err => this.errorService.handle(err));
                    }
                })
                .subscribe((payrollRun: PayrollRun) => {
                    if (payrollRun['_IncludeRecurringPosts'] === undefined) {
                        payrollRun['_IncludeRecurringPosts'] = !payrollRun.ExcludeRecurringPosts;
                    }
                    this.payrollrun$.next(payrollRun);
                    if (payrollRun && payrollRun.PayDate) {
                        this.payDate = new Date(payrollRun.PayDate.toString());
                    }
                    this.payStatus = this.payrollrunService.getStatus(payrollRun).text;

                    this.updatePoster();

                    if (this.formIsReady) {
                        this.setEditMode();
                    }

                    this.toolbarconfig = {
                        title: payrollRun ?
                            (payrollRun.Description ?
                                payrollRun.Description : 'Lønnsavregning ' + this.payrollrunID)
                            : 'Ny lønnsavregning',
                        subheads: [{
                            title: payrollRun ?
                                (payrollRun.Description ? 'Lønnsavregning ' + this.payrollrunID : '')
                                : ''
                        },
                        {
                            title: this.payDate ?
                                'Utbetales ' + moment(this.payDate).format('DD.MM.YYYY')
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
                            main: payrollRun ? payrollRun.StatusCode < 1 : true,
                            disabled: true
                        },
                        {
                            label: 'Kontroller',
                            action: this.openControlModal.bind(this),
                            main: false,
                            disabled: payrollRun ? payrollRun.StatusCode > 0 : true
                        },
                        {
                            label: 'Avregn',
                            action: this.runSettling.bind(this),
                            main: false,
                            disabled: payrollRun && this.payrollrunID ? payrollRun.StatusCode > 0 : true
                        },
                        {
                            label: 'Til utbetaling',
                            action: this.sendPaymentList.bind(this),
                            main: payrollRun ? payrollRun.StatusCode > 1 : false,
                            disabled: payrollRun ? payrollRun.StatusCode < 1 : true
                        },
                        {
                            label: 'Bokfør',
                            action: this.openPostingSummaryModal.bind(this),
                            main: payrollRun ? payrollRun.StatusCode === 1 : false,
                            disabled: payrollRun ? payrollRun.StatusCode !== 1 : true
                        }
                    ];

                    this.checkDirty();
                    if (this.changedPayroll && !payrollRun.Description && !this.detailsActive) {
                        this.toggleDetailsView();
                    }
                    this.changedPayroll = false;

                }, err => this.errorService.handle(err));

            employeesSubject
                .subscribe((employees: Employee[]) => {
                    this.employees = employees;
                    this.updatePosterSelection();
                });

            super.getStateSubject('salaryTransactions')
                .map((transes: SalaryTransaction[]) => {
                    return transes
                        .map(trans => {
                            if (trans['_newFiles'] && this.journalEntry) {
                                trans['_newFiles']
                                    .map(x => this.fileService
                                        .linkFile('JournalEntry', this.journalEntry.ID, x.ID)
                                        .subscribe(file => file,
                                        err => this.errorService.handle(err)));
                                trans['_newFiles'] = undefined;
                            }
                            return trans;
                        });
                })
                .subscribe((salaryTransactions: SalaryTransaction[]) => {
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
                    let payrollrun = this.payrollrun$.getValue();
                    if (payrollrun) {
                        if (!payrollrun.StatusCode) {
                            this._toastService.addToast('Kan ikke nullstille', ToastType.warn, 4, 'Lønnsavregningen må være avregnet før du kan nullstille den');
                        } else {
                            if (payrollrun.StatusCode < 2 || confirm('Denne lønnsavregningen er bokført, er du sikker på at du vil nullstille?')) {
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
                    if (this.payrollrun$.getValue()) {
                        return this.payrollrun$.getValue().StatusCode < 1;
                    } else {
                        return true;
                    }

                }
            },
            {
                label: 'Utbetalingsliste',
                action: () => {
                    this.showPaymentList();
                },
                disabled: (rowModel) => {
                    return this.payrollrun$.getValue() && this.payrollrunID ? this.payrollrun$.getValue().StatusCode < 1 : true;
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

    private updatePoster() {
        if (this.payrollrunID) {
            this._salarySumsService.getFromPayrollRun(this.payrollrunID)
                .subscribe((totalSums: any) => {
                    let posterFilter = {
                        type: 'table',
                        config: {
                            rows: [
                                {
                                    cells: [
                                        {
                                            text: 'Periode fastlønn',
                                            header: true,
                                            colspan: 3
                                        }
                                    ]
                                },
                                {
                                    cells: [
                                        {
                                            text: moment(this.payrollrun$.getValue().FromDate).format('DD.MM.YYYY'),
                                            header: false
                                        },
                                        {
                                            text: ' - ',
                                            header: false
                                        },
                                        {
                                            text: moment(this.payrollrun$.getValue().ToDate).format('DD.MM.YYYY'),
                                            header: false
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                        posterDates = {
                            type: 'text',
                            config: {
                                topText: [
                                    { text: 'Utbetalingsdato', class: 'large' }
                                ],
                                mainText: { text: moment(this.payrollrun$.getValue().PayDate).format('DD.MM.YYYY') }
                            }
                        },
                        posterPayout = {
                            type: 'text',
                            config: {
                                topText: [
                                    { text: 'Beløp til utbetaling', class: 'large' }
                                ],
                                mainText: { text: this.numberformat.asMoney(totalSums.netPayment) }
                            }
                        };

                    this.payrollrunWidgets[0] = posterFilter;
                    this.payrollrunWidgets[1] = posterDates;
                    this.payrollrunWidgets[3] = posterPayout;
                });
        }
    }

    private updatePosterSelection() {
        this._employeeService.GetAll('filter=deleted eq false')
            .subscribe((employees: Employee[]) => {
                let posterSelection = {
                    type: 'alerts',
                    config: {
                        alerts: [
                            {
                                text: this.employees.length + ' ansatte i lønnsavregningen',
                                class: 'success'
                            },
                            {
                                text: (employees.length - this.employees.length) + ' ansatte utelatt på grunn av utvalg',
                                class: 'error'
                            }
                        ]
                    }
                };

                this.payrollrunWidgets[2] = posterSelection;
            });

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

        if (this.detailsActive && (!this.payrollrun$.getValue().Description || !this.payrollrunID)) {
            let titles: string[] = [];
            let messages: string[] = [];

            if (!this.payrollrun$.getValue().Description) {
                titles.push('Beskrivelse mangler');
                messages.push('utfylt beskrivelse');
            }

            if (!this.payrollrunID) {
                titles.push((titles.length ? 'l' : 'L') + 'ønnsavregning er ikke lagret');
                messages.push('lagret lønnsavregning');
            }

            this._toastService.addToast(`${titles.join(' og ')}`,
                ToastType.bad, ToastTime.medium, `Du må ha ${messages.join(' og ')} før lønnspostene kan vises`);
            return;
        }

        if (this.detailsActive && this.isDirty('payrollRun')) {
            Observable
                .fromPromise(
                this.confirmModal.confirm(
                    'Vil du lagre endringer på lønnavregning?',
                    'Lagre endringer?', true, { accept: 'Lagre', reject: 'Senere' })).subscribe(response => {
                        if (response === ConfirmActions.ACCEPT) {
                            let transes = this.payrollrun$.getValue().transactions;
                            this.payrollrun$.getValue().transactions = undefined;
                            this.payrollrunService
                                .Put(this.payrollrun$.getValue().ID, this.payrollrun$.getValue())
                                .map((payrun: PayrollRun) => {
                                    payrun.transactions = transes;
                                    return payrun;
                                })
                                .subscribe(x => super.updateState('payrollRun', x, false));
                        }
                    });
        }

        if (setValue !== undefined) {
            this.detailsActive = setValue;
        } else {
            this.detailsActive = !this.detailsActive;
        }

        if (this.payrollrun$.getValue() && !this.detailsActive && this.selectionList) {
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
                        .fromPromise( this.confirmModal.confirmSave() )
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
        this.payrollrunService.layout('payrollrunDetailsForm').subscribe(layout => this.fields$.next(layout.Fields));
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
        this.getSalaryTransactionsObservable()
            .subscribe(
            response => {
                super.updateState('salaryTransactions', response, false);
            }
            , err => this.errorService.handle(err));
    }

    private getSalaryTransactionsObservable(): Observable<SalaryTransaction[]> {
        let salaryTransactionFilter = `PayrollRunID eq ${this.payrollrunID}`;
        return this.payrollrunID
            ? Observable
                .forkJoin(
                this._salaryTransactionService.GetAll(
                    'filter=' + salaryTransactionFilter + '&orderBy=IsRecurringPost DESC',
                    ['WageType.SupplementaryInformations', 'employment', 'Supplements'
                        , 'Dimensions', 'Files']),
                this.getProjectsObservable(),
                this.getDepartmentsObservable())
                .do((response: [SalaryTransaction[], Project[], Department[]]) => {
                    if (this.selectionList) {
                        this.selectionList.updateSums();
                    }
                    let transes = response[0];
                    let checkToast: boolean = this.salaryTransactions
                        && !this.salaryTransactions
                            .filter(x => x.ID)
                            .some(x => !x.IsRecurringPost);

                    this.tagConfig.readOnly = transes
                        .some(x => !x.IsRecurringPost);

                    if (checkToast && this.tagConfig.readOnly) {
                        this._toastService
                            .addToast(
                            'Kategoriutvalg er låst',
                            ToastType.warn,
                            ToastTime.medium,
                            'Siden det er variable poster i lønnsavregningen');
                    }
                })
                .map((response: [SalaryTransaction[], Project[], Department[]]) => {
                    let [transes, projects, departments] = response;
                    return transes.map(trans => {

                        if (trans.DimensionsID) {
                            trans['_Department'] = departments ? departments
                                .find(x => x.ID === trans.Dimensions.DepartmentID) : undefined;

                            trans['_Project'] = projects ? projects
                                .find(x => x.ID === trans.Dimensions.ProjectID) : undefined;
                        }

                        trans['_FileIDs'] = trans['Files'].map(x => x.ID);

                        let account = new Account();
                        account.AccountNumber = trans.Account;
                        trans['_Account'] = account;

                        return trans;
                    });
                })
            : Observable.of([]);
    }

    private getPayrollRun() {
        if (this.payrollrunID) {
            this.payrollrunService.get(this.payrollrunID).
                subscribe((payroll: PayrollRun) => {
                    this.payrollrun$.next(payroll);
                    if (payroll) {
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
                this.setDefaults();
                let latest: PayrollRun = last;
                let companysalary: CompanySalary = salaries[0];
                this.activeFinancialYear = activeYear;

                if (payroll && payroll.ID === 0) {
                    payroll.ID = null;
                    this.suggestFromToDates(latest, companysalary);
                }

                if (payroll) {
                    payroll.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                }
                this.payrollrun$.next(payroll);
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
        this.payrollrun$.getValue().taxdrawfactor = TaxDrawFactor.Standard;
    }

    private suggestFromToDates(latest: PayrollRun, companysalary: CompanySalary) {
        if (!latest) {
            // First payrollrun for the year
            let todate: Date;
            let fromdate = new Date(this.activeFinancialYear.Year, 0, 1);
            this.payrollrun$.getValue().FromDate = fromdate;

            switch (companysalary.PaymentInterval) {
                case CompanySalaryPaymentInterval.Pr14Days:
                    todate = new Date(this.activeFinancialYear.Year, 0, 14);
                    this.payrollrun$.getValue().ToDate = todate;
                    break;

                case CompanySalaryPaymentInterval.Weekly:
                    todate = new Date(this.activeFinancialYear.Year, 0, 7);
                    this.payrollrun$.getValue().ToDate = todate;
                    break;

                default: // Monthly
                    todate = new Date(this.activeFinancialYear.Year, 0, 31);
                    this.payrollrun$.getValue().ToDate = todate;
                    break;
            }
        } else {
            let lastTodate = moment(latest.ToDate);
            let lastFromdate = lastTodate.clone();
            lastFromdate.add(1, 'days');
            let fromdateAsDate = new Date(lastFromdate);
            let todateAsDate: Date;

            this.payrollrun$.getValue().FromDate = fromdateAsDate;

            switch (companysalary.PaymentInterval) {
                case CompanySalaryPaymentInterval.Pr14Days:
                    lastTodate.add(14, 'days');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun$.getValue().ToDate = todateAsDate;
                    break;

                case CompanySalaryPaymentInterval.Weekly:
                    lastTodate.add(7, 'days');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun$.getValue().ToDate = todateAsDate;
                    break;

                default:
                    lastTodate = lastFromdate.clone().endOf('month');
                    todateAsDate = new Date(lastTodate);
                    this.payrollrun$.getValue().ToDate = todateAsDate;
                    break;
            }
        }
    }

    private getEmployees() {
        this.payrollrunID
            ? this.payrollrunService
                .getEmployeesOnPayroll(this.payrollrunID,
                ['Employments.Dimensions', 'BusinessRelationInfo', 'SubEntity.BusinessRelationInfo', 'BusinessRelationInfo.BankAccounts'])
                .subscribe((employees: Employee[]) => {
                    this.updateTax(employees);
                    this.updateState('employees', employees, false);
                }, err => this.errorService.handle(err))
            : this.updateState('employees', [], false);
    }

    private getWageTypes() {
        this._wageTypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
            this.updateState('wagetypes', wagetypes, false);
        });
    }

    private getProjectsObservable() {
        return this.projects
            ? Observable.of(this.projects)
            : this._projectService
                .GetAll('')
                .do(x => super.updateState('projects', x, false));
    }

    private getDepartmentsObservable() {
        return this.departments
            ? Observable.of(this.departments)
            : this._departmentService
                .GetAll('')
                .do(x => super.updateState('departments', x, false));
    }

    private checkDirty() {
        if (this.saveActions && this.saveActions.length && this.payrollrun$.getValue() && !this.payrollrun$.getValue().StatusCode) {
            let saveButton = this.saveActions.find(x => x.label === 'Lagre');
            let calculateButton = this.saveActions.find(x => x.label === 'Avregn');
            if (super.isDirty() || (this.payrollrun$.getValue() && !this.payrollrun$.getValue().Description)) {
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
                this.router.navigateByUrl(this.url + 0);
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
        if (this.payrollrun$.getValue()) {
            if (this.payrollrun$.getValue().StatusCode === 1) {
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
                            this.payrollrun$.next(previous);
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
                    this.payrollrun$.next(next);
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

    public showPaymentList() {
        this._reportDefinitionService.getReportByName('Utbetalingsliste').subscribe((report) => {
            this.previewModal.openWithId(report, this.payrollrun$.getValue().ID, 'RunID');
        });
    }

    public sendPaymentList() {
        this.payrollrunService.sendPaymentList(this.payrollrunID)
            .subscribe((response: boolean) => {
                this.router.navigateByUrl('/bank/payments');
            },
            (err) => {
                this.errorService.handle(err);
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
        return this.fields$.getValue().find((fld) => fld.Property === name);
    }

    private setEditMode() {
        var idField: UniFieldLayout;
        if (this.payrollrun$.getValue()) {
            if (this.payrollrun$.getValue().StatusCode > 0) {
                this.isEditable = false;
                this.uniform.readMode();
            } else {
                this.isEditable = true;
                this.uniform.editMode();
            }
        } else {
            this.isEditable = true;
            this.uniform.editMode();
        }
        idField = this.findByProperty('ID');
        idField.ReadOnly = true;
        var recurringTransCheck: UniFieldLayout = this.findByProperty('_IncludeRecurringPosts');
        var noNegativePayCheck: UniFieldLayout = this.findByProperty('1');
        if (this.isEditable) {
            recurringTransCheck.ReadOnly = false;
            noNegativePayCheck.ReadOnly = false;
        } else {
            recurringTransCheck.ReadOnly = true;
            noNegativePayCheck.ReadOnly = true;
        }
        this.fields$.next(this.fields$.getValue());
    }

    public ready(value) {
        this.setEditMode();
        this.formIsReady = true;
    }

    private saveAll(done: (message: string) => void) {

        if (!this.payrollrun$.getValue().PayDate) {
            this._toastService
                .addToast('Utbetalingsdato mangler', ToastType.bad, 3, 'Du må angi utbetalingsdato før du kan lagre');
            this.uniform.field('PayDate').focus();
            done('');
            return;
        }

        this.setEditableOnChildren(false);

        this.savePayrollrun()
            .switchMap((payrollRun: PayrollRun) => {
                this.payrollrun$.next(payrollRun);
                super.updateState('payrollRun', payrollRun, false);
                if (!this.payrollrunID) {
                    this.router.navigateByUrl(this.url + payrollRun.ID);
                    return Observable.of(undefined);
                }

                return this.getSalaryTransactionsObservable();
            })
            .finally(() => this.setEditableOnChildren(true))
            .subscribe((salaryTransactions: SalaryTransaction[]) => {
                if (salaryTransactions !== undefined) {
                    super.updateState('salaryTransactions', salaryTransactions, false);
                    this.toggleDetailsView(false);
                }
                done('Lagret');
            },
            (err) => {
                done('Feil ved lagring');
                this.errorService.handle(err);
            });
    }

    private change(changes: SimpleChanges) {
        let payrollRun = this.payrollrun$.getValue();
        payrollRun.ExcludeRecurringPosts = !payrollRun['_IncludeRecurringPosts'];
        super.updateState('payrollRun', payrollRun, true);
    }

    private populateCategoryFilters() {
        this.categoryFilter = [];
        this.categories.map(x => this.categoryFilter.push({ id: x.ID, title: x.Name }));
        this.tagConfig.description = this.categoryFilter.length ? 'Utvalg: ' : 'Utvalg';
    }

    private setEditableOnChildren(isEditable: boolean) {
        if (this.selectionList) {
            this.selectionList.setEditable(isEditable);
        }
    }

    public savePayrollrun(): Observable<PayrollRun> {
        let retObs = null;
        if (!this.payrollrun$.getValue().ID) {
            this.payrollrun$.getValue().ID = 0;
        }

        if (this.payrollrun$.getValue().ID > 0) {
            this.payrollrun$.getValue().transactions = _.cloneDeep(this.salaryTransactions
                .filter(x => x['_isDirty'] || x.Deleted));
            this.payrollrun$.getValue().transactions.map((trans: SalaryTransaction) => {
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
            retObs = this.payrollrunService.Put(this.payrollrun$.getValue().ID, this.payrollrun$.getValue());
        } else {
            retObs = this.payrollrunService.Post(this.payrollrun$.getValue());
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
            x => {
                this.getEmployeeCategories();
                this.getEmployees();
                this.getSalaryTransactions();
            },
            err => this.errorService.handle(err));
    }
}
