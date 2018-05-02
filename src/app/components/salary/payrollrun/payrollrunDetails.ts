import {Component, ViewChild, OnDestroy, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {
    PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement, WageType, Account, EmployeeTaxCard,
    CompanySalary, CompanySalaryPaymentInterval, Project, Department, TaxDrawFactor, EmployeeCategory,
    JournalEntry, LocalDate
} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ControlModal} from './modals/controlModal';
import {PostingSummaryModal} from './modals/postingSummaryModal';
import {VacationPayModal} from './modals/vacationpay/vacationPayModal';
import {TimeTransferComponent} from './modals/time-transfer/time-transfer.component';
import {UniForm} from '../../../../framework/ui/uniform/index';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {IToolbarConfig, IToolbarSearchConfig} from '../../common/toolbar/toolbar';
import {IUniTagsConfig, ITag} from '../../common/toolbar/tags';
import {IStatus, STATUSTRACK_STATES} from '../../common/toolbar/statustrack';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {SalaryTransactionSelectionList} from '../salarytrans/salarytransactionSelectionList';
import {UniView} from '../../../../framework/core/uniView';
import {UniPreviewModal} from '../../reports/modals/preview/previewModal';
import {UniModalService, ConfirmActions} from '../../../../framework/uni-modal';
import {IUniSaveAction} from '../../../../framework/save/save';
import 'rxjs/add/observable/forkJoin';
import {
    PayrollrunService, UniCacheService, SalaryTransactionService, EmployeeService, WageTypeService,
    ReportDefinitionService, CompanySalaryService, ProjectService, DepartmentService, EmployeeTaxCardService,
    YearService, ErrorService, EmployeeCategoryService, FileService,
    JournalEntryService, PayrollRunPaymentStatus, SupplementService
} from '../../../services/services';
import {PayrollRunDetailsService} from './services/payrollRunDetailsService';
import {PaycheckSenderModal} from './sending/paycheckSenderModal';

declare var _;
import * as moment from 'moment';

const PAYROLL_RUN_KEY: string = 'payrollRun';

@Component({
    selector: 'payrollrun-details',
    templateUrl: './payrollrunDetails.html',
})

export class PayrollrunDetails extends UniView implements OnDestroy {
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    @ViewChild(UniForm) public uniform: UniForm;
    private payrollrun$: BehaviorSubject<PayrollRun> = new BehaviorSubject(undefined);
    private payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    @ViewChild(ControlModal) public controlModal: ControlModal;
    @ViewChild(SalaryTransactionSelectionList) private selectionList: SalaryTransactionSelectionList;
    private busy: boolean = false;
    private url: string = '/salary/payrollrun/';
    private contextMenuItems: IContextMenuItem[] = [];
    private toolbarconfig: IToolbarConfig;
    private disableFilter: boolean;
    private saveActions: IUniSaveAction[] = [];
    private activeYear: number;

    private employees: Employee[];
    private salaryTransactions: SalaryTransaction[];
    private wagetypes: WageType[];
    private projects: Project[];
    private departments: Department[];
    private detailsActive: boolean = false;
    private categories: EmployeeCategory[];
    private journalEntry: JournalEntry;
    private paymentStatus: PayrollRunPaymentStatus;

    public categoryFilter: ITag[] = [];
    public tagConfig: IUniTagsConfig = {
        description: 'Utvalg ',
        helpText: 'Ansatte i følgende kategorier er med i denne lønnsavregningen:',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: EmployeeCategory) => obj ? obj.Name : '',
            valueProperty: 'Name',
            search: (query, ignoreFilter) => this.employeeCategoryService.searchCategories(query, ignoreFilter),
            saveCallback: (cat: EmployeeCategory) => this.payrollrunService.savePayrollTag(this.payrollrunID, cat),
            deleteCallback: (tag) => this.payrollrunService.deletePayrollTag(this.payrollrunID, tag)
        }
    };

    private posterEmps$: ReplaySubject<Employee[]> = new ReplaySubject(1);
    private posterPayrollRun$: ReplaySubject<PayrollRun> = new ReplaySubject(1);

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
        private yearService: YearService,
        private employeeCategoryService: EmployeeCategoryService,
        private fileService: FileService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService,
        private payrollRunDetailsService: PayrollRunDetailsService,
        private supplementService: SupplementService
    ) {
        super(router.url, cacheService);
        this.getLayout();
        this.config$.next({
            submitText: ''
        });

        this.route.params.subscribe(params => {
            this.journalEntry = undefined;
            let changedPayroll = true;
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

            const payrollRunSubject = super.getStateSubject(PAYROLL_RUN_KEY);
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
                .do((payrollRun: PayrollRun) => {
                    const oldValue = this.payrollrun$.getValue();
                    if (!oldValue
                        || (oldValue.StatusCode !== payrollRun.StatusCode || oldValue.ID !== payrollRun.ID)) {
                        this.toggleReadOnlyOnCategories(this.salaryTransactions, payrollRun);
                    }
                })
                .do(payrollRun => {
                    if (!super.isDirty(PAYROLL_RUN_KEY)) {
                        this.posterPayrollRun$.next(payrollRun);
                    }
                    this.searchConfig$.next(this.payrollRunDetailsService.setupSearchConfig(payrollRun));
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

                    this.toolbarconfig = {
                        subheads: [
                        {
                            title: payrollRun.JournalEntryNumber ?
                                'Bilag ' + payrollRun.JournalEntryNumber
                                : '',
                            link: payrollRun.JournalEntryNumber
                                ? '#/accounting/transquery;JournalEntryNumber='
                                    + payrollRun.JournalEntryNumber
                                : ''
                        },
                        {
                            title: 'Oppsett',
                            classname: this.detailsActive
                                ? 'entityDetails_toggle -is-active'
                                : 'entityDetails_toggle',
                            event: this.toggleDetailsView.bind(this)
                        }],
                        navigation: {
                            prev: this.previousPayrollrun.bind(this),
                            next: this.nextPayrollrun.bind(this),
                            add: this.newPayrollrun.bind(this)
                        },
                    };

                    this.saveActions = this.getSaveActions(payrollRun);

                    this.checkDirty();
                    if (changedPayroll) {
                        if (!payrollRun.Description && !this.detailsActive) {
                            this.toggleDetailsView();
                        }
                    }
                    if (!super.isDirty(PAYROLL_RUN_KEY)) {
                        this.setEditMode(payrollRun);
                    }
                    changedPayroll = false;

                }, err => this.errorService.handle(err));

            employeesSubject
                .do(employees => {
                    if (!super.isDirty('employees')) {
                        this.posterEmps$.next(employees);
                    }
                })
                .subscribe((employees: Employee[]) => this.employees = employees);

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
                },
                disabled: (rowModel) => {
                    return this.payrollrun$.getValue() && this.payrollrunID
                        ? this.payrollrun$.getValue().StatusCode > 0
                        : false;
                }
            },
            {
                label: 'Overfør timer til lønn',
                action: () => {
                    this.openTimeTransferModal();
                },
                disabled: (rowModel) => {
                    return this.payrollrun$.getValue() && this.payrollrunID
                        ? this.payrollrun$.getValue().StatusCode > 0
                        : false;
                }
            },
            {
                label: 'Rekalkuler skatt',
                action: () => {
                    this.recalcTaxOnPayrun();
                },
                disabled: (rowModel) => {
                    if (this.payrollrun$.getValue()) {
                        return this.payrollrun$.getValue().StatusCode >= 1;
                    } else {
                        return true;
                    }
                }
            },
            {
                label: 'Nullstill lønnsavregning',
                action: () => {
                    this.busy = true;
                    this.payrollRunDetailsService
                    .resetRun(this.payrollrun$.getValue())
                    .finally(() => this.busy = false)
                    .subscribe(refresh => {
                        if (refresh) {
                            this.getData();
                        }
                    });
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
                    return this.payrollrun$.getValue() && this.payrollrunID
                        ? this.payrollrun$.getValue().StatusCode < 1
                        : true;
                }
            },
            {
                label: 'Slett lønnsavregning',
                action: () => this.payrollRunDetailsService.deletePayrollRun(this.payrollrunID),
                disabled: () => {
                    return this.payrollrun$.getValue() && !!this.payrollrun$.getValue().StatusCode;
                }
            }
        ];

        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd) {
                const routeList = event.url.split('/');
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

    private getSaveActions(payrollRun: PayrollRun): IUniSaveAction[] {
        return [
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
                action: this.SendIfNotAlreadySent.bind(this),
                main: payrollRun
                    ? payrollRun.StatusCode > 1
                    && (!this.paymentStatus || this.paymentStatus < PayrollRunPaymentStatus.SentToPayment)
                    : false,
                disabled: payrollRun ? payrollRun.StatusCode < 1 : true
            },
            {
                label: 'Send lønnslipp',
                action: this.sendPaychecks.bind(this),
                main: payrollRun
                    ? payrollRun.StatusCode > 1
                    && this.paymentStatus && this.paymentStatus >= PayrollRunPaymentStatus.SentToPayment
                    : false,
                disabled: payrollRun ? payrollRun.StatusCode < 1 : true
            },
            {
                label: 'Bokfør',
                action: this.openPostingSummaryModal.bind(this),
                main: payrollRun ? payrollRun.StatusCode === 1 : false,
                disabled: payrollRun ? payrollRun.StatusCode !== 1 : true
            }
        ];
    }

    public ngOnDestroy() {
        this.payrollrunID = undefined;
    }

    private updateTax(employees: Employee[]) {
        let filter: string = 'filter=';
        const employeeFilterTable: string[] = [];

        this.yearService
            .getActiveYear()
            .switchMap(financialYear => {
                employees.forEach(employee => {
                    employeeFilterTable.push('EmployeeID eq ' + employee.ID);
                });
                filter += '(' + employeeFilterTable.join(' or ') + ') ';
                filter += `and Year le ${financialYear}&orderby=Year DESC`;
                filter += `&expand=${this._employeeTaxCardService.taxExpands()}`;

                return employeeFilterTable.length
                    ? this._employeeTaxCardService.GetAll(filter)
                    : Observable.of([]);
            })
            .subscribe((taxCards: EmployeeTaxCard[]) => {
                employees.map(employee => {
                    const taxCard = taxCards.find(x => x.EmployeeID === employee.ID);
                    employee.TaxCards = taxCard ? [taxCard] : [];
                });
                super.updateState('employees', employees, false);
            });
    }

    public toggleDetailsView(setValue?: boolean): void {
        const payrollRun = this.payrollrun$.getValue();
        if (this.detailsActive && (!payrollRun.Description || !payrollRun.ID)) {
            const titles: string[] = [];
            const messages: string[] = [];

            if (!payrollRun.Description) {
                titles.push('Beskrivelse mangler');
                messages.push('utfylt beskrivelse');
            }

            if (!payrollRun.ID) {
                titles.push((titles.length ? 'l' : 'L') + 'ønnsavregning er ikke lagret');
                messages.push('lagret lønnsavregning');
            }

            this._toastService.addToast(`${titles.join(' og ')}`,
                ToastType.bad, ToastTime.medium, `Du må ha ${messages.join(' og ')} før lønnspostene kan vises`);
            return;
        }

        if (this.detailsActive && this.isDirty(PAYROLL_RUN_KEY)) {
            this.modalService.confirm({
                header: 'Ulagrede endringer',
                message: 'Ønsker du å lagre endringene på lønnsavregningen?',
                buttonLabels: {
                    accept: 'Lagre',
                    cancel: 'Senere'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    const entity = this.payrollrun$.getValue();
                    this.payrollrunService.Put(entity.ID, entity).subscribe(
                        res => {
                            this.getSalaryTransactions();
                            super.updateState(PAYROLL_RUN_KEY, res, false);
                        },
                        err => this.errorService.handle(err)
                    );
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

        const _toolbarconfig = this.toolbarconfig,
            _subhead = _toolbarconfig.subheads[_toolbarconfig.subheads.length - 1];
        if (this.detailsActive) {
            _subhead.classname = 'entityDetails_toggle -is-active';
        } else {
            _subhead.classname = 'entityDetails_toggle';
        }
        this.toolbarconfig = _toolbarconfig;
    }

    public setPaymentStatus(status: PayrollRunPaymentStatus) {
        this.paymentStatus = status;
        this.payrollrun$
            .asObservable()
            .take(1)
            .subscribe(payrollRun => {
                this.saveActions = this.getSaveActions(payrollRun);
                this.checkDirty();
            });
    }

    public canDeactivate(): Observable<boolean> {
        if (!super.isDirty()) {
            return Observable.of(true);
        }

        return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveAll(m => {}, false);
                }

                return result !== ConfirmActions.CANCEL;
            })
            .map(canDeactivate => {
                if (canDeactivate) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }

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
        const salaryTransactionFilter = `PayrollRunID eq ${this.payrollrunID}`;
        return this.payrollrunID
            ? Observable
                .forkJoin(
                this._salaryTransactionService
                    .GetAll(
                    'filter=' + salaryTransactionFilter + '&orderBy=IsRecurringPost DESC,SalaryBalanceID DESC,SystemType DESC',
                    ['WageType.SupplementaryInformations', 'employment', 'Supplements'
                        , 'Dimensions', 'Files'])
                    .do((transes: SalaryTransaction[]) => {
                        if (this.selectionList) {
                            this.selectionList.updateSums();
                        }

                        this.toggleReadOnlyOnCategories(transes, this.payrollrun$.getValue());
                    }),
                this.getProjectsObservable(),
                this.getDepartmentsObservable())
                .map((response: [SalaryTransaction[], Project[], Department[]]) => {
                    const [transes, projects, departments] = response;
                    return transes.map(trans => {

                        if (trans.DimensionsID) {
                            trans['_Department'] = departments ? departments
                                .find(x => x.ID === trans.Dimensions.DepartmentID) : undefined;

                            trans['_Project'] = projects ? projects
                                .find(x => x.ID === trans.Dimensions.ProjectID) : undefined;
                        }
                        trans['_FileIDs'] = trans['Files'].map(x => x.ID);

                        const account = new Account();
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
                    if (payroll) {
                        payroll.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                    }
                    this.updateState(PAYROLL_RUN_KEY, payroll, false);
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
                this.yearService.getActiveYear()
            ).subscribe((dataSet: any) => {
                const [payroll, last, salaries, activeYear] = dataSet;
                this.setDefaults(payroll);
                const latest: PayrollRun = last;
                const companysalary: CompanySalary = salaries;
                this.activeYear = activeYear;

                if (payroll && payroll.ID === 0) {
                    payroll.ID = null;
                    this.payrollRunDetailsService.suggestFromToDates(latest, companysalary, payroll, this.activeYear);
                }

                if (payroll) {
                    payroll.StatusCode < 1 ? this.disableFilter = false : this.disableFilter = true;
                }
                this.payrollrun$.next(payroll);
                this.updateState(PAYROLL_RUN_KEY, payroll, false);

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

    private setDefaults(payrollRun: PayrollRun) {
        payrollRun.taxdrawfactor = TaxDrawFactor.Standard;
    }

    private getEmployees() {
        this.payrollrunID
            ? this.payrollrunService
                .getEmployeesOnPayroll(this.payrollrunID,
                    ['Employments.Dimensions', 'BusinessRelationInfo',
                        'SubEntity.BusinessRelationInfo', 'BusinessRelationInfo.BankAccounts']
                ).subscribe((employees: Employee[]) => {
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
        const saveActions = _.cloneDeep(this.saveActions);
        if (saveActions && saveActions.length
            && this.payrollrun$.getValue() && !this.payrollrun$.getValue().StatusCode
        ) {
            const saveButton = saveActions.find(x => x.label === 'Lagre');
            const calculateButton = saveActions.find(x => x.label === 'Avregn');
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
            this.saveActions = saveActions;
        }
    }

    public getStatustrackConfig() {
        const statuses: string[] = ['Opprettet', 'Avregnet', 'Bokført'];
        const statustrack: IStatus[] = [];
        const activeIndex = statuses.indexOf(this.payStatus);

        statuses.forEach((status, i) => {
            let _state: STATUSTRACK_STATES;

            if (i > activeIndex) {
                _state = STATUSTRACK_STATES.Future;
            } else if (i < activeIndex) {
                _state = STATUSTRACK_STATES.Completed;
            } else if (i === activeIndex) {
                _state = STATUSTRACK_STATES.Active;
            }

            statustrack[i] = {
                title: status,
                state: _state
            };
        });
        return statustrack;
    }

    private toggleReadOnlyOnCategories(transes: SalaryTransaction[], run: PayrollRun) {
        transes = transes || [];
        const anyEditableTranses = transes
            .some(trans => !trans.IsRecurringPost && !trans.SalaryBalanceID);
            const runIsCalculated = run && run.StatusCode >= 1;
        this.tagConfig.readOnly = anyEditableTranses || runIsCalculated;

        if (runIsCalculated) {
            this.tagConfig.toolTip = 'Låst fordi lønnsavregningen er avregnet';
        } else if (anyEditableTranses) {
            this.tagConfig.toolTip = 'Låst på grunn av variable poster';
        } else {
            this.tagConfig.toolTip = '';
        }
    }

    public newPayrollrun() {
        this.canDeactivate().subscribe(result => {
            if (result) {
                this.router.navigateByUrl(this.url + 0);
            }
        });
    }

    public openPostingSummaryModal(done) {
        this.payrollrun$
            .asObservable()
            .take(1)
            .subscribe(run => {
                this.modalService
                    .open(
                    PostingSummaryModal,
                    {
                        data: run,
                        modalConfig: {
                            update: () => this.getPayrollRun()
                        }
                    });
            });

        done('');
    }

    public openControlModal(done) {
        this.payrollrun$
            .asObservable()
            .take(1)
            .subscribe(run => this.modalService.open(ControlModal, {
                data: run,
                modalConfig: {
                    update: () => this.getPayrollRun()
                }
            }));
        done('');
    }

    public openVacationPayModal() {
        this.payrollrun$
            .asObservable()
            .take(1)
            .switchMap(run =>
                this.modalService
                    .open(
                    VacationPayModal,
                    {
                        modalConfig:
                        {
                            update: () => this.getSalaryTransactions()
                        },
                        data: run
                    })
                    .onClose)
            .subscribe(needUpdate => {
                if (needUpdate) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                }
            });
    }

    public openTimeTransferModal() {
        this.payrollrun$
            .asObservable()
            .take(1)
            .switchMap(run =>
                this.modalService
                    .open(TimeTransferComponent, {
                        data: run
                    })
                .onClose)
            .subscribe(needUpdate => {
                if (needUpdate) {
                    this.getPayrollRun();
                    this.getSalaryTransactions();
                }
            });
    }

    public recalcTaxOnPayrun() {
        const payrollrun = this.payrollrun$.getValue();
        if (payrollrun) {
            if (payrollrun.StatusCode && payrollrun.StatusCode >= 2) {
                this._toastService.addToast(
                    'Kan ikke rekalkulere', ToastType.warn, 4,
                    'Lønnsavregningen må være åpen for å rekalkulere'
                );
            } else {
                this.busy = true;
                this.payrollrunService
                    .recalculateTax(this.payrollrunID)
                    .finally(() => this.busy = false)
                    .subscribe(() => {
                        this.getData();
                    }, err => this.errorService.handle(err));
            }
        }
    }

    public openPaycheckSendingModal() {
        this.modalService.open(PaycheckSenderModal, {data: this.payrollrunID});
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
        this.payrollrunService.runSettling(this.payrollrunID, done)
            .finally(() => this.busy = false)
            .subscribe((bResponse: boolean) => {
                if (bResponse) {
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
            report.parameters = [{Name: 'RunID', value: this.payrollrun$.getValue().ID}];
            this.modalService.open(UniPreviewModal, {
                data: report
            });
        });
    }

    private SendIfNotAlreadySent(done) {
        if (this.paymentStatus && this.paymentStatus >= PayrollRunPaymentStatus.SentToPayment) {
            this.modalService.confirm({
                header: 'Utbetale en gang til',
                message: 'Denne lønnsavregningen er allerede sendt til utbetaling, '
                    + 'vennligst bekreft at du vil sende lønnsavregningen til utbetaling igjen',
                buttonLabels: {
                    accept: 'Utbetal',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(response => {
                if (response === ConfirmActions.ACCEPT) {
                    this.sendPaymentList();
                } else {
                    done('Utbetaling avbrutt');
                }
            });
        } else {
            this.sendPaymentList();
        }
    }

    public sendPaymentList() {
        this.payrollrunService.sendPaymentList(this.payrollrunID)
            .subscribe((response: boolean) => {
                this.router.navigateByUrl('/bank');
            },
            (err) => {
                this.errorService.handle(err);
            });
    }

    public sendPaychecks(done) {
        this.openPaycheckSendingModal();
        done('');
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

    private setEditMode(payrollRun: PayrollRun) {
        this.fields$.getValue().map(field => field.ReadOnly = payrollRun.StatusCode);
        this.findByProperty('ID').ReadOnly = true;
        this.fields$.next(this.fields$.getValue());
    }

    public ready(value) {}

    private saveAll(done: (message: string) => void, updateView = true) {

        if (!this.payrollrun$.getValue().PayDate) {
            this._toastService
                .addToast('Utbetalingsdato mangler', ToastType.bad, 3, 'Du må angi utbetalingsdato før du kan lagre');
            this.uniform.field('PayDate').focus();
            done('');
            return;
        }

        this.setEditableOnChildren(false);
        super.getStateSubject(PAYROLL_RUN_KEY)
            .asObservable()
            .take(1)
            .switchMap(run => this.savePayrollrun(run, done))
            .do(() => this._salaryTransactionService.invalidateCache())
            .filter(() => updateView)
            .switchMap((payrollRun: PayrollRun) => {
                this.payrollrun$.next(payrollRun);
                super.updateState(PAYROLL_RUN_KEY, payrollRun, false);
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
                }
                this.toggleDetailsView(false);
                done('Lagret');
            },
            (err) => {
                done('Feil ved lagring');
                this.errorService.handle(err);
            });
    }

    public change(changes: SimpleChanges) {
        this.payrollrun$
            .asObservable()
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => {
                    const change = changes[key];
                    return change.previousValue !== change.currentValue;
                }))
            .map(payrollRun => {
                payrollRun.ExcludeRecurringPosts = !payrollRun['_IncludeRecurringPosts'];
                return payrollRun;
            })
            .subscribe(payrollRun => super.updateState(PAYROLL_RUN_KEY, payrollRun, true));
    }

    private populateCategoryFilters() {
        this.categoryFilter = [];
        this.categories.map(x => this.categoryFilter.push({linkID: x.ID, title: x.Name}));
        this.tagConfig.description = this.categoryFilter.length ? 'Utvalg: ' : 'Utvalg';
    }

    private setEditableOnChildren(isEditable: boolean) {
        if (this.selectionList) {
            this.selectionList.setEditable(isEditable);
        }
    }

    public savePayrollrun(payrollRun: PayrollRun, done: (message: string) => void = null): Observable<PayrollRun> {
        if (!payrollRun.ID) {
            payrollRun.ID = 0;
        }

        if (payrollRun.ID) {
            payrollRun.transactions = _.cloneDeep(this.salaryTransactions
                .filter(x => !x['_isEmpty'] && (x['_isDirty'] || x.Deleted)));
            payrollRun.transactions.map((trans: SalaryTransaction) => {
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
                } else {
                    trans.Supplements = null;
                }
                trans.Wagetype = null;
                trans.Employee = null;
                return trans;
            });
        }

        return this.payrollrunService
            .savePayrollRun(payrollRun)
            .do(ret => this.supplementService.checkForChangedSupplements(ret))
            .catch((err, obs) => this.handleError(err, obs, done));
    }

    private handleError(err, obs, done: (message: string) => void = null) {
        if (done) {
            done('Feil ved lagring');
        }
        return this.errorService.handleRxCatch(err, obs);
    }

    public updatePayrollRun() {
        this.getPayrollRun();
    }

    public updateTranses() {
        this.busy = true;
        super.getStateSubject(PAYROLL_RUN_KEY)
            .asObservable()
            .take(1)
            .switchMap(run => this.savePayrollrun(run))
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
        this.getEmployees();
        this.getSalaryTransactions();
    }
}
