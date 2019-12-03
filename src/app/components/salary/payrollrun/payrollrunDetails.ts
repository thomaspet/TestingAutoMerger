import {Component, ViewChild, OnDestroy, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {
    PayrollRun, SalaryTransaction, Employee, SalaryTransactionSupplement, WageType, Account,
    CompanySalary, Project, Department, TaxDrawFactor, EmployeeCategory,
    JournalEntry, StdSystemType, EmployeeTaxCard, SubEntity, AccountDimension
} from '../../../unientities';
import {Observable, BehaviorSubject, Subject, of} from 'rxjs';
import {tap, take, switchMap, filter, finalize, map, catchError, takeUntil} from 'rxjs/operators';
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
import {
    PayrollrunService, UniCacheService, SalaryTransactionService, EmployeeService, WageTypeService,
    ReportDefinitionService, CompanySalaryService, ProjectService, DepartmentService, EmployeeTaxCardService,
    FinancialYearService, ErrorService, EmployeeCategoryService, FileService,
    JournalEntryService, PayrollRunPaymentStatus, SupplementService,
    SalarySumsService, StatisticsService, SubEntityService, BrowserStorageService, AccountMandatoryDimensionService, IEmployee
} from '../../../services/services';
import {PayrollRunDetailsService} from './services/payrollRunDetailsService';
import {PaycheckSenderModal} from './sending/paycheckSenderModal';

import * as _ from 'lodash';
import * as moment from 'moment';
import { TaxCardModal } from '../employee/modals/taxCardModal';

const PAYROLL_RUN_KEY: string = 'payrollRun';
const SALARY_TRANS_KEY: string = 'salaryTransactions';
const DIRTY_KEY: string = '_isDirty';
const TRANSES_BUSY_KEY: string = 'transes_busy';
const SELECTED_EMP_KEY: string = 'selected_emp';
const CATEGORIES_KEY: string = 'categories';
const REFRESH_SUMS_KEY: string = 'refresh_sums';
const SUB_ENTITIES_KEY: string = 'sub_entities';
const REFRESH_TAX: string = 'refresh_tax';
const EMP_COUNT: string = 'employee_count';
const REFRESH_EMPS_ACTION: string = 'refresh_emps_action';

interface IFromToFilter {
    from: number;
    to: number;
}

@Component({
    selector: 'payrollrun-details',
    templateUrl: './payrollrunDetails.html',
    styleUrls: ['./payrollRunDetails.sass']
})

export class PayrollrunDetails extends UniView implements OnDestroy {
    @ViewChild(ControlModal) public controlModal: ControlModal;
    @ViewChild(SalaryTransactionSelectionList) private selectionList: SalaryTransactionSelectionList;
    @ViewChild(UniForm) public uniform: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public searchConfig$: BehaviorSubject<IToolbarSearchConfig> = new BehaviorSubject(null);
    public destroy$: Subject<void> = new Subject<void>();

    public payrollrun$: BehaviorSubject<PayrollRun> = new BehaviorSubject(undefined);
    public payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    public employees: Employee[] = [];

    public busy: boolean = false;
    private url: string = '/salary/payrollrun/';
    public contextMenuItems: IContextMenuItem[] = [];
    public toolbarconfig: IToolbarConfig;
    private disableFilter: boolean;
    public saveActions: IUniSaveAction[] = [];
    private activeYear: number;
    private emp: Employee;
    private showFunctions: boolean = true;
    private browserStorageItemName: string = 'showFunctionsPayrollRunDetails';

    public creatingRun: boolean;
    public saving: boolean;
    private salaryTransactions: SalaryTransaction[];
    private wagetypes: WageType[];
    private projects: Project[];
    private departments: Department[];
    public detailsActive: boolean = false;
    private categories: EmployeeCategory[];
    private journalEntry: JournalEntry;
    private paymentStatus: PayrollRunPaymentStatus;
    private accountsWithMandatoryDimensionsIsUsed = true;
    private selectedEmp: IEmployee;
    private subEntities: SubEntity[];
    public categoryFilter: ITag[] = [];
    public empCount: number;
    public tagConfig: IUniTagsConfig = {
        description: 'Utvalg ',
        helpText: 'Ansatte i følgende kategorier er med i denne lønnsavregningen:',
        helpTextOnEmpty: 'Ingen kategorier valgt for denne lønnsavregningen',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: EmployeeCategory) => obj ? `${obj.ID} - ${obj.Name}` : '',
            valueProperty: 'Name',
            search: (query, ignoreFilter) => this.employeeCategoryService.searchCategories(query, ignoreFilter),
            saveCallback: (cat: EmployeeCategory) => this.setCategory(this.payrollrunID, cat),
            deleteCallback: (tag) => this.payrollrunService.deletePayrollTag(this.payrollrunID, tag)
        },
        template: tag => `${tag.linkID} - ${tag.title}`
    };

    public paymentSum: number;

    constructor(
        private route: ActivatedRoute,
        private payrollrunService: PayrollrunService,
        private router: Router, private tabSer: TabService,
        private _toastService: ToastService,
        protected cacheService: UniCacheService,
        private _salaryTransactionService: SalaryTransactionService,
        private _wageTypeService: WageTypeService,
        private errorService: ErrorService,
        private _reportDefinitionService: ReportDefinitionService,
        private _companySalaryService: CompanySalaryService,
        private _projectService: ProjectService,
        private _departmentService: DepartmentService,
        private financialYearService: FinancialYearService,
        private employeeCategoryService: EmployeeCategoryService,
        private fileService: FileService,
        private journalEntryService: JournalEntryService,
        private modalService: UniModalService,
        private payrollRunDetailsService: PayrollRunDetailsService,
        private supplementService: SupplementService,
        private statisticsService: StatisticsService,
        private subEntityService: SubEntityService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService,
        private browserStorage: BrowserStorageService,
        private employeeService: EmployeeService,
    ) {
        super(router.url, cacheService);
        this.getLayout();
        this.config$.next({
            submitText: ''
        });

        this.showFunctions = this.browserStorage.getItem(this.browserStorageItemName);

        this.route.params.subscribe(params => {
            this.journalEntry = undefined;
            let changedPayroll = true;
            this.payrollrunID = +params['id'];
            this.tagConfig.readOnly = !this.payrollrunID;
            if (!this.payrollrunID) {
                this.setEditableOnChildren(false);
            }
            super.updateCacheKey(this.router.url);
            this.salaryTransactions = undefined;
            this.categoryFilter = [];
            this.categories = [];

            const payrollRunSubject = super.getStateSubject(PAYROLL_RUN_KEY)
                .takeUntil(
                    this.destroy$
                );
            const selectEmpSubject$ = super.getStateSubject(SELECTED_EMP_KEY).takeUntil(this.destroy$);
            const categories$ = super.getStateSubject(CATEGORIES_KEY).takeUntil(this.destroy$);
            const subEntities$ = super.getStateSubject(SUB_ENTITIES_KEY).takeUntil(this.destroy$);
            const empCount$ = super.getStateSubject(EMP_COUNT).takeUntil(this.destroy$);

            empCount$.subscribe(count => this.empCount = count);

            subEntities$
                .subscribe(subs => this.subEntities = subs);

            payrollRunSubject
                .pipe(
                    tap(() => this.updateSum(this.payrollrunID).subscribe()),
                )
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
                .subscribe((payrollRun: PayrollRun) => {
                    this.searchConfig$.next(this.payrollRunDetailsService.setupSearchConfig(payrollRun));

                    if (payrollRun['_IncludeRecurringPosts'] === undefined) {
                        payrollRun['_IncludeRecurringPosts'] = !payrollRun.ExcludeRecurringPosts;
                    }
                    this.payrollrun$.next(payrollRun);
                    if (payrollRun && payrollRun.PayDate) {
                        this.payDate = new Date(payrollRun.PayDate.toString());
                    }
                    this.payStatus = this.payrollrunService.getStatus(payrollRun).text;

                    const url = `/#/accounting/transquery?JournalEntryNumber=`;

                    this.toolbarconfig = {
                        subheads: [
                        {
                            title: payrollRun.JournalEntryNumber ?
                                'Bilag ' + payrollRun.JournalEntryNumber
                                : '',
                            link: payrollRun.JournalEntryNumber ? (payrollRun.JournalEntryNumber.split('-').length > 1
                            ? url +
                                `${payrollRun.JournalEntryNumber.split('-')[0]}&AccountYear=${payrollRun.JournalEntryNumber.split('-')[1]}`
                            : url + `${payrollRun.JournalEntryNumber}&AccountYear=${new Date().getFullYear()}`)
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
                        statustrack: this.getStatustrackConfig()
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

            selectEmpSubject$
                .pipe(
                    tap(emp => this.selectedEmp = emp),
                )
                .subscribe((emp: Employee) => this.onEmpChange(emp));

            categories$.subscribe(cats => {
                this.categories = cats;
                this.populateCategoryFilters(cats);
            });

            super.getStateSubject(SALARY_TRANS_KEY)
                .takeUntil(this.destroy$)
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

            super.getStateSubject('wagetypes').takeUntil(this.destroy$).subscribe((wagetypes) => {
                this.wagetypes = wagetypes;
            });

            super.getStateSubject('projects').takeUntil(this.destroy$).subscribe((projects) => {
                this.projects = projects;
            });

            super.getStateSubject('departments').takeUntil(this.destroy$).subscribe((departments) => {
                this.departments = departments;
            });

            this.accountMandatoryDimensionService.GetNumberOfAccountsWithMandatoryDimensions().subscribe(count => {
                this.accountsWithMandatoryDimensionsIsUsed = count > 0;
            });

            this.updateTabStrip(this.payrollrunID);
        });

        this.contextMenuItems = [
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
                            this.updateState(REFRESH_SUMS_KEY, true, false);
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
            },
            {
                label: 'Gå til variable lønnsposter',
                action: () => this.router.navigateByUrl('/salary/variablepayrolls/' + this.payrollrunID),
            }
        ];

        this.router.events.takeUntil(this.destroy$).subscribe((event: any) => {
            if (event instanceof NavigationEnd && this.payrollrunID !== undefined) {
                this.getData();
            }
        });
    }

    private onEmpChange(emp: Employee) {
        super.getStateSubject(SALARY_TRANS_KEY)
            .pipe(
                takeUntil(this.destroy$),
                take(1),
                filter((transes: SalaryTransaction[]) => !transes.some(trans => trans.EmployeeID === emp.ID))
            )
            .subscribe(() => this.addEmpTranses(emp.ID));
    }

    toggleShowFunctions() {
        this.showFunctions = !this.showFunctions;
        this.browserStorage.setItem(this.browserStorageItemName, this.showFunctions);
    }

    openTaxCardModal() {
        this.modalService.open(TaxCardModal, {
            data: this.employeeService.convertToEmployee(this.selectedEmp),
            modalConfig: { },
            closeOnClickOutside: false
        }).onClose.subscribe(res => {
                if (!res) { return; }

                this.updateState(REFRESH_TAX, true, false);
                this.updateState(REFRESH_SUMS_KEY, true, false);
                this.updateSum(this.payrollrunID);
            });
    }

    transferHoursToSalary() {
       this.openTimeTransferModal();
    }

    transferTravelsToSalary() {
       this.payrollRunDetailsService.routeToTravel(this.payrollrun$.getValue());
    }

    generateVacationPay() {
       this.openVacationPayModal();
    }

    private setCategory = (runID: number, category: EmployeeCategory) => {
        return this.payrollrunService.savePayrollTag(runID, category);
    }

    private updateSum(runID: number) {
        return Observable
            .of(runID)
            .pipe(
                filter(id => !!id),
                switchMap(id => this.statisticsService
                    .GetAll(
                        `model=SalaryTransaction`
                    +   `&select=sum(Sum) as sum`
                    +   `&filter=Wagetype.Base_Payment ne 0 and PayrollRunID eq ${id}`
                    +   `&expand=Wagetype`)),
                map(res => res.Data[0] && res.Data[0].sum),
                tap(sum => this.paymentSum = sum),
            );
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
        this.destroy$.next();
    }

    private accountOnTransesSet(): boolean {
        if (this.salaryTransactions) {
            for (let i = 0; i < this.salaryTransactions.length; i++) {
                const trans = this.salaryTransactions[i];
                if (!trans.Sum) {
                    continue;
                }
                if (!trans.Account) {
                    this._toastService
                        .addToast('Konto mangler',
                            ToastType.warn,
                            ToastTime.medium,
                            `Ansatt nr ${trans.EmployeeNumber}:
                            Lønnspost nr ${trans.ID},
                            med lønnsart ${trans.WageTypeNumber},
                            tekst '${trans.Text}' mangler konto`);
                    return false;
                }
            }
            return true;
        }
        return false;
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

        this.accountOnTransesSet();

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
                            this.refreshTranses();
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
                name: 'SALARY.PAYROLL.NUMBER~' + payrollrunID,
                url: 'salary/payrollrun/' + payrollrunID,
                moduleID: UniModules.Payrollrun,
                active: true
            });
        } else {
            this.tabSer.addTab({
                name: 'SALARY.PAYROLL.NEW',
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
        this.getSubEntities();
        this.getWageTypes();
        this.getPayrollRun();
        this.refreshTranses();
        this.getEmployeeCategories();
    }

    private getSubEntities() {
        if (this.subEntities) {
            super.updateState(SUB_ENTITIES_KEY, this.subEntities, false);
            return;
        }
        this.subEntityService
            .GetAll(null, ['BusinessRelationInfo'])
            .subscribe(subs => super.updateState(SUB_ENTITIES_KEY, subs, false));
    }

    private refreshTranses() {
        return this.cleanAndGetTranses()
            .subscribe(transes => super.updateState(SALARY_TRANS_KEY, transes, false));
    }

    private cleanAndGetTranses() {
        this._salaryTransactionService.invalidateCache();
        super.updateState(SALARY_TRANS_KEY, [], false);
        return super.getStateSubject(SELECTED_EMP_KEY)
        .pipe(
            takeUntil(this.destroy$),
            take(1),
            switchMap(emp => this.getSalaryTransactionsObservable(emp && emp.ID))
        );
    }

    private getEmployeeCategories() {
        this.payrollrunService
            .getCategoriesOnRun(this.payrollrunID)
            .subscribe(categories => super.updateState(CATEGORIES_KEY, categories, false));
    }

    private addEmpTranses(empID: number) {
        super.updateState(TRANSES_BUSY_KEY, true, false);
        this.getSalaryTransactionsObservable(empID)
            .pipe(
                switchMap(transes => {
                    return super.getStateSubject(SALARY_TRANS_KEY)
                        .pipe(
                            takeUntil(this.destroy$),
                            take(1),
                            map((transState: SalaryTransaction[]) => [
                                ...transState.filter(trans => trans.EmployeeID !== empID),
                                ...transes,
                            ])
                        );
                }),
                catchError((err, obs) => this.errorService.handleRxCatch(err, obs)),
                finalize(() => super.updateState(TRANSES_BUSY_KEY, false, false))
            )
            .subscribe((response: SalaryTransaction[]) =>
                super.updateState(SALARY_TRANS_KEY, response, response.some(trans => trans[DIRTY_KEY] || trans.Deleted)));
    }

    private getSalaryTransactionsObservable(empID: number): Observable<SalaryTransaction[]> {
        if (!empID) {
            return of([]);
        }
        const salaryTransactionFilter = `PayrollRunID eq ${this.payrollrunID} and EmployeeID eq ${empID}`;
        return this.payrollrunID
            ? Observable
                .forkJoin(
                this._salaryTransactionService
                    .GetAll(
                    'filter=' + salaryTransactionFilter + '&orderBy=IsRecurringPost DESC,SalaryBalanceID DESC,SystemType DESC',
                    ['WageType.SupplementaryInformations', 'employment', 'Supplements'
                        , 'Dimensions', 'Files', 'VatType.VatTypePercentages'])
                    .do((transes: SalaryTransaction[]) => this.toggleReadOnlyOnCategories(transes, this.payrollrun$.getValue())),
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

                        // making trans files array with only truthy values
                        trans['Files'] = trans['Files'].filter(x => !!x);
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
        this.activeYear = this.financialYearService.getActiveYear();

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
                this._companySalaryService.getCompanySalary()
            ).subscribe((dataSet: any) => {
                const [payroll, last, salaries] = dataSet;
                this.setDefaults(payroll);
                const latest: PayrollRun = last;
                const companysalary: CompanySalary = salaries;

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

    private getWageTypes() {
        this._wageTypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
            this.updateState('wagetypes', wagetypes, false);
        });
    }

    private getProjectsObservable() {
        return this.projects
            ? Observable.of(this.projects)
                .do(x => super.updateState('projects', x, false))
            : this._projectService
                .GetAll('')
                .do(x => super.updateState('projects', x, false));
    }

    private getDepartmentsObservable() {
        return this.departments
            ? Observable.of(this.departments)
                .do(x => super.updateState('departments', x, false))
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
            .some(trans => !trans.IsRecurringPost && trans.SystemType !== StdSystemType.HolidayPayDeduction && !trans.SalaryBalanceID);
            const runIsCalculated = run && run.StatusCode >= 1;
        this.tagConfig.readOnly = anyEditableTranses || runIsCalculated;

        if (runIsCalculated) {
            this.tagConfig.helpText = 'Låst fordi lønnsavregningen er avregnet';
            this.tagConfig.readOnlyMessage = 'Låst fordi lønnsavregningen er avregnet';
        } else if (anyEditableTranses) {
            this.tagConfig.helpText = 'Lønnsavregningen inneholder variable lønnsposter, kategoriutvalget kan derfor ikke endres.';
            this.tagConfig.readOnlyMessage = 'Lønnsavregningen inneholder variable lønnsposter, kategoriutvalget kan derfor ikke endres.';
        } else {
            this.tagConfig.helpText = '';
            this.tagConfig.readOnlyMessage = '';
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
        this.statisticsService.GetAll(`model=SalaryTransaction&filter=PayrollRunID eq ${this.payrollrun$.value.ID}`)
            .subscribe(res => {
                const count = res.Data[0].countid;

                if (count > 1000) {
                    done('');
                    return this._toastService.addToast(
                        'Kan ikke åpne kontroll modal',
                        ToastType.warn,
                        0,
                        'Lønnsavregningen inneholder mange lønnsposter. Vi anbefaler at du benytter Oversikt' +
                        ' - Lønnsposter, her kan du benytte filtre for å begrense datamengden',

                    );
                }
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
            });
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
                            update: () => this.refreshTranses()
                        },
                        data: run
                    })
                    .onClose)
            .subscribe(needUpdate => {
                if (needUpdate) {
                    this.refreshAll();
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
                    this.refreshAll();
                }
            });
    }

    private refreshAll() {
        this.getPayrollRun();
        this.refreshTranses();
        super.updateState(REFRESH_EMPS_ACTION, true, false);
        super.updateState(REFRESH_SUMS_KEY, true, false);
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
                        this.updateState(REFRESH_SUMS_KEY, true, false);
                        this.getData();
                    }, err => this.errorService.handle(err));
            }
        }
    }

    public openPaycheckSendingModal() {
        this.modalService.open(PaycheckSenderModal, {
            closeOnClickOutside: true,
            data: this.payrollrunID
        });
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
                    this.refreshTranses();
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
                    this.sendPaymentList(done);
                } else {
                    done('Utbetaling avbrutt');
                }
            });
        } else {
            this.sendPaymentList(done);
        }
    }

    public sendPaymentList(done) {
        this.payrollrunService.sendPaymentList(this.payrollrunID)
            .subscribe((response: boolean) => {
                this.router.navigateByUrl('/bank/ticker');
            },
            (err) => {
                done('');
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
                    this.refreshTranses();
                }
            },
            err => this.errorService.handle(err));
    }

    private findByProperty(name) {
        return this.fields$.getValue().find((fld) => fld.Property === name);
    }

    private setEditMode(payrollRun: PayrollRun) {
        this.fields$.getValue().map(field => field.ReadOnly = !!payrollRun.StatusCode);
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
        let refreshEmps: boolean;
        this.setEditableOnChildren(false);
        super.getStateSubject(PAYROLL_RUN_KEY)
            .pipe(
                takeUntil(this.destroy$),
                take(1),
                tap(run => refreshEmps = run[DIRTY_KEY]),
                tap((run) => this.creatingRun = !run.ID),
                switchMap(run => this.savePayrollrun(run, done)),
                tap(() => {
                    if (!refreshEmps) {
                        return;
                    }
                    super.updateState(REFRESH_EMPS_ACTION, null, false);
                }),
                tap(() => this._salaryTransactionService.invalidateCache()),
                tap(() => this._wageTypeService.invalidateCache()),
                filter(() => updateView),
                switchMap((payrollRun: PayrollRun) => {
                    this.payrollrun$.next(payrollRun);
                    super.updateState(PAYROLL_RUN_KEY, payrollRun, false);
                    if (!this.payrollrunID) {
                        this.router.navigateByUrl(this.url + payrollRun.ID);
                        return Observable.of(undefined);
                    }
                    if (this.accountsWithMandatoryDimensionsIsUsed && payrollRun.transactions) {
                        let msg: string = '';
                        this.accountMandatoryDimensionService.getMandatoryDimensionsReportsForPayroll(payrollRun.transactions)
                        .subscribe((reports) => {
                            if (reports) {
                                reports.forEach(report => {
                                    if (report) {
                                        if (report.MissingRequiredDimensionsMessage !== '') {
                                            msg += '! ' +  report.MissingRequiredDimensionsMessage + '<br/>';
                                        }
                                        if (report.MissingOnlyWarningsDimensionsMessage) {
                                            msg += report.MissingOnlyWarningsDimensionsMessage + '<br/>';
                                        }
                                    }
                                });
                                if (msg !== '') {
                                    this._toastService.toast({
                                        title: 'Dimensjon(er) mangler',
                                        message: msg,
                                        type: ToastType.warn,
                                        duration: 3
                                    });
                                }
                            }
                        });
                    }
                    return this.cleanAndGetTranses();
                }),
                finalize(() => {
                    this.creatingRun = false;
                    this.setEditableOnChildren(true);
                    super.updateState(REFRESH_SUMS_KEY, true, false);
                })
            )
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
                const refreshFields = [
                    '_IncludeRecurringPosts',
                    'FromDate',
                    'ToDate',
                    'PayDate',
                ];
                payrollRun[DIRTY_KEY] = refreshFields.some(field => !!changes[field]);
                return payrollRun;
            })
            .subscribe(payrollRun => super.updateState(PAYROLL_RUN_KEY, payrollRun, true));
    }

    private populateCategoryFilters(categories: EmployeeCategory[]) {
        this.categoryFilter = [];
        categories.map(x => this.categoryFilter.push({linkID: x.ID, title: x.Name}));
        this.tagConfig.description = this.categoryFilter.length ? 'Utvalg: ' : 'Utvalg';
    }

    private setEditableOnChildren(isEditable: boolean) {
        if (this.selectionList) {
            this.selectionList.setEditable(isEditable);
        }
    }

    public setBusyOnChildren(busy) {
        if (this.selectionList) {
            this.selectionList.setEditable(!busy);
            this.selectionList.busy = busy;
            if (busy) {
                this.saveActions = this.saveActions.map(x => {x.disabled = true; return x; });
            } else {
                this.saveActions = this.getSaveActions(this.payrollrun$.value);
                this.checkDirty();
            }
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
            .catch((err, obs) => {
                this.creatingRun = false;
                return this.handleError(err, obs, done);
            });
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
                this.refreshTranses();
            },
            (err) => {
                this.errorService.handle(err);
            }
            );
    }

    public filterChange(tags: any[]) {
        this.refreshTranses();
        this.getEmployeeCategories();
    }
}
