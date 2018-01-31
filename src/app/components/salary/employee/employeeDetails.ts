import {Component, ViewChild, OnDestroy, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {
    Employee, Employment, EmployeeLeave, SalaryTransaction, Project, Dimensions,
    Department, SubEntity, SalaryTransactionSupplement, EmployeeTaxCard,
    WageType, EmployeeCategory, BusinessRelation, SalaryBalance, UniEntity
} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {IToolbarConfig, IAutoCompleteConfig, IToolbarSearchConfig, UniToolbar} from '../../common/toolbar/toolbar';
import {IUniTagsConfig, ITag} from '../../common/toolbar/tags';
import {IPosterWidget} from '../../common/poster/poster';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniView} from '../../../../framework/core/uniView';
import {TaxCardModal} from './modals/taxCardModal';
import {
    UniModalService,
    ConfirmActions
} from '../../../../framework/uniModal/barrel';
import {
    EmployeeService, EmploymentService, EmployeeLeaveService, DepartmentService, ProjectService,
    SalaryTransactionService, UniCacheService, SubEntityService, EmployeeTaxCardService, ErrorService,
    NumberFormat, WageTypeService, SalarySumsService, YearService, BankAccountService, EmployeeCategoryService,
    ModulusService, SalarybalanceService, SalaryBalanceLineService
} from '../../../services/services';
import {EmployeeDetailsService} from './services/employeeDetailsService';
import {Subscription} from 'rxjs/Subscription';
import {SalaryBalanceViewService} from '@app/components/salary/salarybalance/services/salaryBalanceViewService';
declare var _;
const EMPLOYEE_TAX_KEY = 'employeeTaxCard';
const EMPLOYMENTS_KEY = 'employments';
const RECURRING_POSTS_KEY = 'recurringPosts';
const SALARYBALANCES_KEY = 'salarybalances';
const EMPLOYEE_LEAVE_KEY = 'employeeLeave';
const EMPLOYEE_KEY = 'employee';
const SUB_ENTITIES_KEY = 'subEntities';
const SAVING_KEY = 'viewSaving';
const SAVE_TRIGGER_KEY = 'save';
const NEW_TRIGGER_KEY = 'new';
const SELECTED_KEY = '_rowSelected';

type DirtyStatuses = {
    employee?: boolean,
    employeeTaxCard?: boolean,
    employments?: boolean,
    employeeLeave?: boolean,
    recurringPosts?: boolean,
    salarybalances?: boolean
};
@Component({
    selector: 'uni-employee-details',
    templateUrl: './employeeDetails.html'
})
export class EmployeeDetails extends UniView implements OnDestroy {

    public busy: boolean;
    private url: string = '/salary/employees/';
    private childRoutes: any[];
    private saveStatus: {numberOfRequests: number, completeCount: number, hasErrors: boolean};

    private employeeID: number;
    private employee: Employee;
    private posterEmployee: any = {};
    private employments: Employment[];
    private recurringPosts: SalaryTransaction[];
    private salarybalances: SalaryBalance[];
    private employeeLeave: EmployeeLeave[];
    private subEntities: SubEntity[];
    private projects: Project[];
    private departments: Department[];
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private toolbarSearchConfig: IToolbarSearchConfig;
    private employeeTaxCard: EmployeeTaxCard;
    private wageTypes: WageType[] = [];
    private activeYear$: ReplaySubject<number> = new ReplaySubject(1);
    private categories: EmployeeCategory[];
    private savedNewEmployee: boolean;
    private taxOptions: any;
    private subscriptions: Subscription[] = [];

    public categoryFilter: ITag[] = [];
    public tagConfig: IUniTagsConfig = {
        helpText: 'Kategorier på ansatt',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: EmployeeCategory) => obj ? obj.Name : '',
            valueProperty: 'Name',
            saveCallback: (cat: EmployeeCategory) => this.employeeService.saveEmployeeTag(this.employeeID, cat),
            deleteCallback: (tag) => this.employeeService.deleteEmployeeTag(this.employeeID, tag),
            search: (query, ignoreFilter) => this.employeeCategoryService.searchCategories(query, ignoreFilter)
        }
    };

    @ViewChild(UniToolbar) public toolbar: UniToolbar;

    private employeeWidgets: IPosterWidget[] = [
        {
            type: 'contact',
            config: {
                contacts: []
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                mainText: {text: ''}
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
                },
                {
                    text: '',
                    class: ''
                }]
            }
        },
        {
            type: 'text',
            size: 'small',
            config: {
                mainText: {text: ''},
            }
        }
    ];

    private employeeSearch: IAutoCompleteConfig;

    private expandOptionsNewTaxcardEntity: Array<string> = [
        'loennFraHovedarbeidsgiver',
        'loennFraBiarbeidsgiver',
        'pensjon',
        'loennTilUtenrikstjenestemann',
        ',loennKunTrygdeavgiftTilUtenlandskBorger',
        'loennKunTrygdeavgiftTilUtenlandskBorgerSomGrensegjenger'
    ];

    constructor(
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private employeeLeaveService: EmployeeLeaveService,
        private employmentService: EmploymentService,
        private salaryTransService: SalaryTransactionService,
        private subEntityService: SubEntityService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private http: UniHttp,
        private numberformat: NumberFormat,
        private employeeTaxCardService: EmployeeTaxCardService,
        private salarySumsService: SalarySumsService,
        private wageTypeService: WageTypeService,
        private yearService: YearService,
        private bankaccountService: BankAccountService,
        private employeeCategoryService: EmployeeCategoryService,
        private modulusService: ModulusService,
        private modalService: UniModalService,
        private employeeDetailsService: EmployeeDetailsService,
        private salarybalanceService: SalarybalanceService,
        private salaryBalanceViewService: SalaryBalanceViewService,
        private salaryBalanceLineService: SalaryBalanceLineService
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            {name: 'Detaljer', path: 'personal-details'},
            {name: 'Skatt', path: 'employee-tax'},
            {name: 'Arbeidsforhold', path: 'employments'},
            {name: 'Faste poster', path: 'recurring-post'},
            {name: 'Forskudd/trekk', path: 'employee-salarybalances'},
            {name: 'Permisjon', path: 'employee-leave'}
        ];

        // TODO: remove me!
        this.employeeSearch = {
            events: {
                select: (model, value: Employee) => {
                    if (value) {
                        this.router.navigate(['salary/employees/' + value.ID]);
                    }
                }
            },
            valueProperty: 'ID',
            template: (obj: Employee) =>
                obj
                    ? `${obj.EmployeeNumber} - ${obj.BusinessRelationInfo ? obj.BusinessRelationInfo.Name : ''}`
                    : '',
            search: (query) => this.employeeService
                .GetAll(
                `filter=startswith(EmployeeNumber, '${query}') `
                + `or (BusinessRelationID gt 0 and contains(BusinessRelationInfo.Name, '${query}'))`
                + `&top50`, ['BusinessrelationInfo'])
                .debounceTime(200)
        };

        this.subscriptions
            .push(this.yearService
                .getActiveYear()
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe((year) => this.activeYear$.next(year)));

        this.route.params.subscribe((params) => {
            this.employeeID = +params['id'];
            this.tagConfig.readOnly = !this.employeeID;

            if (!this.employeeID) {
                // If we're dealing with a new employee, just fire up an empty state poster
                this.employeeWidgets = [
                    {
                        type: 'contact',
                        config: {
                            contacts: [{value: 'Ny ansatt'}]
                        }
                    },
                    {
                        type: 'text',
                        size: 'small',
                        config: {
                            topText: [{text: 'Ingen lønn utbetalt'}]
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
                            },
                            {
                                text: '',
                                class: ''
                            }]
                        }
                    },
                    {
                        type: 'text',
                        size: 'small',
                        config: {
                            topText: [{text: 'Ingen aktive arbeidsforhold'}]
                        }
                    }
                ];
            }

            // Update cache key and clear data variables when employee ID is changed
            super.updateCacheKey(this.router.url);

            super.getStateSubject(SAVE_TRIGGER_KEY)
                .subscribe((type: Type<UniEntity>) => this.triggerSave(type));
            super.getStateSubject(NEW_TRIGGER_KEY)
                .subscribe((type: Type<UniEntity>) => this.createNewChildEntity(type));

            if (!this.employeeID) {
                this.cacheService.clearPageCache(this.cacheKey);

                Observable
                    .combineLatest(
                    super.getStateSubject(EMPLOYEE_KEY),
                    super.getStateSubject(SUB_ENTITIES_KEY)
                    )
                    .take(1)
                    .map((result: [Employee, SubEntity[]]) => {
                        let [emp, subEntities] = result;

                        if (!emp.SubEntityID) {
                            if (subEntities && subEntities.length > 1) {
                                subEntities = subEntities.filter(sub => sub.SuperiorOrganizationID);
                            }
                            if (subEntities && subEntities.length === 1) {
                                emp.SubEntityID = subEntities[0].ID;
                            }
                        }

                        return emp;
                    })
                    .subscribe(emp => super.updateState(EMPLOYEE_KEY, emp, super.isDirty(EMPLOYEE_KEY)));
            }

            this.employments = undefined;
            this.employeeLeave = undefined;
            this.recurringPosts = undefined;
            this.employeeTaxCard = undefined;
            this.categories = undefined;
            this.taxOptions = undefined;
            this.salarybalances = undefined;

            // (Re)subscribe to state var updates
            super.getStateSubject(EMPLOYEE_KEY)
                .do(employee => this.updateTabStrip(employee))
                .subscribe((employee) => {
                    this.employee = employee;
                    this.posterEmployee.employee = employee;
                    this.posterEmployee = _.cloneDeep(this.posterEmployee);

                    const info = employee && employee.BusinessRelationInfo;
                    this.toolbarConfig = {
                        title: (info && info.Name) || 'Ny ansatt',
                        navigation: {
                            prev: this.previousEmployee.bind(this),
                            next: this.nextEmployee.bind(this),
                            add: this.newEmployee.bind(this)
                        }
                    };

                    this.toolbarSearchConfig = this.employeeDetailsService.setupToolbarSearchConfig(employee);

                    this.saveActions = [{
                        label: 'Lagre',
                        action: this.saveAll.bind(this),
                        main: true,
                        disabled: true
                    }];
                    this.updatePosterEmployee(this.employee);
                    this.checkDirty();
                }, err => this.errorService.handle(err));

            super.getStateSubject(EMPLOYMENTS_KEY).subscribe((employments) => {
                this.employments = employments;
                this.posterEmployee.employments = employments;
                this.posterEmployee = _.cloneDeep(this.posterEmployee);
                this.checkDirty();
                if (this.employeeID) {
                    this.updatePosterEmployments(employments);
                }
            }, err => this.errorService.handle(err));

            super.getStateSubject(SALARYBALANCES_KEY)
                .do(salaryBalances => this.checkSelectedOnChildEntities(salaryBalances, SalaryBalance))
                .subscribe((salarybalances) => {
                    this.salarybalances = salarybalances;
                    this.checkDirty();
                }, err => this.errorService.handle(err));

            super.getStateSubject(RECURRING_POSTS_KEY).subscribe((recurringPosts) => {
                this.recurringPosts = recurringPosts;
                this.checkDirty();
            }, err => this.errorService.handle(err));

            super.getStateSubject(EMPLOYEE_LEAVE_KEY).subscribe((employeeLeave) => {
                this.employeeLeave = employeeLeave;
                this.checkDirty();
            }, err => this.errorService.handle(err));

            super.getStateSubject(SUB_ENTITIES_KEY).subscribe((subEntities: SubEntity[]) => {
                this.subEntities = subEntities;
            }, err => this.errorService.handle(err));

            super.getStateSubject('projects').subscribe((projects) => {
                this.projects = projects;
            });

            super.getStateSubject('departments').subscribe((departments) => {
                this.departments = departments;
            });

            super.getStateSubject('wageTypes').subscribe((wageTypes: WageType[]) => {
                this.wageTypes = wageTypes;
            });

            super.getStateSubject(EMPLOYEE_TAX_KEY)
                .subscribe((employeeTaxCard: EmployeeTaxCard) => {
                    this.employeeTaxCard = employeeTaxCard;
                    this.updateTaxAlerts(employeeTaxCard);
                    this.checkDirty();
                });

            super.getStateSubject('taxCardModalCallback')
                .subscribe((options) => this.taxOptions = options);


            // If employee ID was changed by next/prev button clicks employee has been
            // pre-loaded. No need to clear and refresh in these cases
            if (this.employee && this.employee.ID === +params['id']) {
                super.updateState(EMPLOYEE_KEY, this.employee, false);
            } else {
                this.employee = undefined;
            }
        });

        // Subscribe to route changes and load necessary data
        this.subscriptions
            .push(this.router.events.subscribe((event: any) => {
                if (event instanceof NavigationEnd && this.employeeID !== undefined) {
                    const childRoute = event.url.split('/').pop();
                    if (!this.employee) {
                        this.getEmployee();
                    }

                    if (!this.categories) {
                        this.getEmployeeCategories();
                    }

                    if (!this.employeeTaxCard) {
                        this.getTax();
                    }

                    if (!this.taxOptions) {
                        super.updateState('taxCardModalCallback',
                            {
                                openModal: () => this.modalService.open(
                                    TaxCardModal,
                                    {
                                        data: this.employeeID,
                                        modalConfig: {
                                            update: () => {
                                                this.employeeTaxCardService.invalidateCache();
                                                this.getTax();
                                            }
                                        }
                                    })
                            },
                            false);
                    }
                    if (childRoute === 'employments') {
                        if (!this.employments) {
                            this.getEmployments();
                            this.getProjects();
                            this.getDepartments();
                        }
                    }

                    if (childRoute === 'recurring-post') {
                        if (!this.recurringPosts) {
                            this.getRecurringPosts();
                        }
                    }

                    if (childRoute === 'employee-salarybalances') {
                        if (!this.salarybalances) {
                            this.getSalarybalances();
                        }
                    }

                    if (childRoute === 'employee-leave') {
                        if (!this.employeeLeave) {
                            super.getStateSubject(EMPLOYMENTS_KEY)
                                .take(1)
                                .subscribe((employments) => {
                                    this.getEmployeeLeave(employments);
                                });
                        }
                    }

                    if (childRoute !== 'employee-leave' && childRoute !== 'recurring-post') {
                        this.getSubEntities();
                    }
                }
            }));
    }

    private updateTabStrip(employee: Employee) {
        if (employee && employee.ID) {
            this.tabService.addTab({
                name: 'Ansattnr. ' + employee.EmployeeNumber,
                url: this.url + employee.ID,
                moduleID: UniModules.Employees,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny ansatt',
                url: this.url + 0,
                moduleID: UniModules.Employees,
                active: true
            });
        }
    }

    public ngOnDestroy() {
        this.employeeID = undefined;
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty() || this.savedNewEmployee)
            .switchMap(isSaved => isSaved
                ? Observable.of(ConfirmActions.REJECT)
                : this.modalService.openUnsavedChangesModal().onClose)
            .do(action => this.handleSavingOnNavigation(action, '' + this.cacheKey))
            .map(action => action !== ConfirmActions.CANCEL);
    }

    private handleSavingOnNavigation(action: ConfirmActions, cacheKey: string) {
        let obs = Observable.of(null);
        if (action === ConfirmActions.ACCEPT) {
            obs = this.saveAllObs((m) => {}, false);
        }
        if (action !== ConfirmActions.CANCEL) {
            obs.subscribe(() => this.cacheService.clearPageCache(cacheKey));
        }
    }

    public updatePosterEmployee(employee: Employee) {
        if (employee.ID !== 0) {

            // Scaffold our employee widgets
            const posterContact = {
                type: 'contact',
                config: {
                    contacts: []
                }
            },
                posterSalary = {
                    type: 'text',
                    config: {
                        topText: [
                            {text: 'Nettolønn', class: 'large'},
                            {text: 'utbetalt hittil i år', class: 'small'}
                        ],
                        mainText: {text: ''}
                    }
                };

            // Add email, if any
            if (employee.BusinessRelationInfo.Emails && employee.BusinessRelationInfo.Emails[0]) {
                posterContact.config.contacts.push({value: employee.BusinessRelationInfo.Emails[0].EmailAddress});
            }
            // Add phone number, if any
            if (employee.BusinessRelationInfo.Phones && employee.BusinessRelationInfo.Phones[0]) {
                posterContact.config.contacts.push({value: employee.BusinessRelationInfo.Phones[0].Number});
            }

            // Activate the contact widget
            this.employeeWidgets[0] = posterContact;

            if (employee.ID) {
                this.getFinancialYearObs()
                    .switchMap(year => this.salarySumsService.getSumsInYear(year, this.employeeID))
                    .subscribe((data) => {
                        if (data.netPayment) {
                            const add = Math.floor(data.netPayment / 80);
                            let netPaidThisYear: number = 0;
                            const interval = setInterval(() => {
                                netPaidThisYear += add;
                                posterSalary.config.mainText.text = this.numberformat.asMoney(netPaidThisYear);
                                if (netPaidThisYear >= data.netPayment) {
                                    clearInterval(interval);
                                    posterSalary.config.mainText.text = this.numberformat.asMoney(data.netPayment);
                                }
                                this.employeeWidgets[1] = posterSalary;
                            }, 10);
                        } else {
                            posterSalary.config.mainText.text = this.numberformat.asMoney(0);
                            this.employeeWidgets[1] = posterSalary;
                        }
                    }, err => this.errorService.handle(err));
            }
        }

        // Check if the alerts are all a-OK!
        this.updateEmployeeAlerts(employee);
    }

    private updatePosterEmployments(employments) {
        // Scaffold the employments-widget
        const employmentWidget = {
            type: 'text',
            config: {
                topText: [{text: '', class: 'large'}],
                mainText: {text: ''},
                bottomText: [{text: 'Ingen aktive arbeidsforhold'}]
            }
        };

        // Add employments
        if (employments.length > 0) {
            let standardIndex = 0;
            let actives = 0;
            for (let i = 0; i < employments.length; i++) {
                const active = !employments[i].EndDate || new Date(employments[i].EndDate) > new Date();
                if (active) {
                    actives++;
                }
                if (employments[i].Standard) {
                    standardIndex = i;
                }
            }

            if (actives > 0) {
                employmentWidget.config.topText[0].text = employments[standardIndex].JobName;
                if (employments[standardIndex].WorkPercent > 0) {
                    employmentWidget.config.mainText.text =
                        this.numberformat.asPercentage(employments[standardIndex].WorkPercent);
                }

                if (actives > 1) {
                    employmentWidget.config.bottomText[0].text = '+' + (actives - 1) +
                        (actives > 2 ? ' stillinger' : ' stilling');
                } else {
                    employmentWidget.config.bottomText[0].text = '';
                }
            } else {
                employmentWidget.config.bottomText[0].text = 'Ingen aktive arbeidsforhold';
            }

        }

        // Send the widget to the poster
        this.employeeWidgets[3] = employmentWidget;
    }

    private updateEmployeeAlerts(employee: Employee) {
        const alerts = this.employeeWidgets[2].config.alerts;
        const checks = this.employeeBoolChecks(employee);

        // Bank acct ok?
        alerts[0] = {
            text: checks.hasAccountNumber ? 'Kontonummer ok' : 'Kontonummer mangler',
            class: checks.hasAccountNumber ? 'success' : 'error'
        };

        // SSN ok?
        alerts[2] = {
            text: checks.hasSSN ? 'Fødselsnummer ok' : 'Fødselsnummer mangler',
            class: checks.hasSSN ? 'success' : 'error'
        };
    }

    private updateTaxAlerts(employeeTaxCard: EmployeeTaxCard) {
        const alerts = this.employeeWidgets[2].config.alerts;
        this.getFinancialYearObs()
            .subscribe((year: number) => {
                const hasTaxCard = this.employeeTaxCardService.hasTaxCard(employeeTaxCard, year);
                // Tax info ok?
                alerts[1] = {
                    text: hasTaxCard
                        ? 'Skattekort ok'
                        : 'Skattekort mangler',
                    class: hasTaxCard
                        ? 'success'
                        : 'error'
                };
            });
    }

    private checkDirty() {
        if (this.saveActions) {
            if (super.isDirty()) {
                this.saveActions[0].disabled = false;
            } else {
                this.saveActions[0].disabled = true;
            }
        }
    }

    // Dummy check to see is user has Tax Card, social security number and account number
    private employeeBoolChecks(employee: Employee): {hasSSN: boolean, hasAccountNumber: boolean} {
        return {
            hasSSN: this.modulusService.validSSN(employee.SocialSecurityNumber),
            hasAccountNumber: employee.BusinessRelationInfo.DefaultBankAccountID !== null
        };
    }

    public nextEmployee() {
        this.employeeService
            .getNext(this.employee.EmployeeNumber)
            .filter(emp => !!emp)
            .switchMap(emp => this.canDeactivate().filter(canDeactivate => !!canDeactivate).map(() => emp))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(next => {
                this.employee = next;
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
            });
    }

    public previousEmployee() {
        this.employeeService
            .getPrevious(this.employee.EmployeeNumber)
            .filter(emp => !!emp)
            .switchMap(emp => this.canDeactivate().filter(canDeactivate => !!canDeactivate).map(() => emp))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(prev => {
                this.employee = prev;
                const childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
            });
    }

    public newEmployee() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.employeeService.get(0).subscribe((emp: Employee) => {
                    this.employee = emp;
                    const childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + emp.ID + '/' + childRoute);
                }, err => this.errorService.handle(err));
            }
        });
    }

    private getEmployee() {
        this.employeeService
            .get(this.employeeID)
            .map(employee => {
                if (!employee.BusinessRelationID && !employee.BusinessRelationInfo) {
                    employee.BusinessRelationInfo = new BusinessRelation();
                    employee.BusinessRelationInfo['_createguid'] = this.employeeService.getNewGuid();
                }
                return employee;
            })
            .subscribe((employee: Employee) => {
                this.employee = employee;
                super.updateState(EMPLOYEE_KEY, employee, false);
            }, err => this.errorService.handle(err));
    }

    private getEmployeeCategories() {
        if (this.employeeID) {
            this.employeeService.getEmployeeCategories(this.employeeID).subscribe(categories => {
                this.categories = categories;
                this.populateCategoryFilters(categories);
            });
        }
    }

    private getTax(): void {
        this.getTaxObservable()
            .subscribe(empTaxcard => {
                super.updateState(EMPLOYEE_TAX_KEY, empTaxcard, false);
            });
    }

    private getTaxObservable(): Observable<EmployeeTaxCard> {
        let year = 2018;
        return this.getFinancialYearObs()
            .switchMap(financialYear => {
                year = financialYear;
                return this.employeeTaxCardService
                    .GetEmployeeTaxCard(this.employeeID, financialYear);
            })
            .switchMap(taxCard => {
                return taxCard
                    ? Observable.of(taxCard)
                    : this.employeeTaxCardService
                        .GetNewEntity(this.expandOptionsNewTaxcardEntity, EMPLOYEE_TAX_KEY)
                        .map((response: EmployeeTaxCard) => {
                            response.EmployeeID = this.employeeID;
                            response.Year = year;
                            return response;
                        });
            })
            .map(taxCard => {
                if (!taxCard.Percent) {
                    taxCard.Percent = undefined;
                }
                if (!taxCard.NonTaxableAmount) {
                    taxCard.NonTaxableAmount = undefined;
                }
                return taxCard;
            });
    }

    private getEmployments(updateEmployments: boolean = true) {
        this.getEmploymentsObservable(updateEmployments)
            .subscribe((employments) => {
                super.updateState(EMPLOYMENTS_KEY, employments, false);
            }, err => this.errorService.handle(err));
    }

    private getEmploymentsObservable(cacheFirst: boolean = false): Observable<Employment[]> {
        return cacheFirst && this.employments
            ? Observable.of(this.employments)
            : this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID, ['Dimensions'])
                .map(employments => {
                    employments
                        .filter(employment => !employment.DimensionsID)
                        .map(x => {
                            x.Dimensions = new Dimensions();
                        });
                    return employments;
                });
    }

    private getSalarybalances() {
        this.getSalarybalancesObservable()
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((salarybalances) => {
                super.updateState(SALARYBALANCES_KEY, salarybalances, false);
            });
    }

    private getSalarybalancesObservable(): Observable<SalaryBalance[]> {
        return this.salarybalanceService
            .GetAll(
            'filter=EmployeeID eq ' + this.employeeID,
            ['Supplier', 'Supplier.Info', 'Supplier.Info.DefaultBankAccount', 'Transactions.SalaryTransaction.payrollrun'])
            .switchMap(salBals => (salBals && salBals.length) || !this.employeeID
                ? Observable.of(salBals || [])
                : this.salarybalanceService
                    .GetNewEntity()
                    .map((salBal: SalaryBalance) => {
                        salBal.EmployeeID = this.employeeID;
                        salBal.FromDate = new Date();
                        salBal._createguid = this.salarybalanceService.getNewGuid();
                        return salBal;
                    })
                    .map(salBal => [salBal]))
            .map(salBals => this.markEntityAsSelected(salBals, salBals[0]));
    }

    private getRecurringPosts() {
        const filter = `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`;
        Observable.forkJoin(
            this.salaryTransService.GetAll('filter=' + filter, ['Supplements.WageTypeSupplement', 'Dimensions']),
            this.getProjectsObservable(),
            this.getDepartmentsObservable(),
            this.getWageTypesObservable(),
            this.getEmploymentsObservable(true))
            .subscribe((response: [SalaryTransaction[], Project[], Department[], WageType[], Employment[]]) => {
                const [transes, projects, departments, wageTypes, employments] = response;

                transes.map(trans => {
                    if (trans.Dimensions) {
                        trans['_Department'] = trans['_Department'] || departments
                            .find(x => x.ID === trans.Dimensions.DepartmentID);

                        trans['_Project'] = trans['_Project'] || projects
                            .find(x => x.ID === trans.Dimensions.ProjectID);
                    }
                    trans['_Wagetype'] = wageTypes.find(x => x.ID === trans.WageTypeID);
                    if (trans['EmploymentID']) {
                        trans['_Employment'] = employments.find(x => x.ID === trans.EmploymentID);
                    }
                });

                super.updateState('projects', projects, false);
                super.updateState('departments', departments, false);
                super.updateState('wageTypes', wageTypes, false);
                super.updateState(RECURRING_POSTS_KEY, transes, false);
            }, err => this.errorService.handle(err));
    }

    private getWageTypesObservable(): Observable<WageType[]> {
        return this.wageTypes && this.wageTypes.length
            ? Observable.of(this.wageTypes)
            : this.wageTypeService.GetAll(null, ['SupplementaryInformations']);
    }

    private getProjects() {
        this.getProjectsObservable().subscribe(projects => {
            super.updateState('projects', projects, false);
        });
    }

    private getProjectsObservable() {
        return this.projects ? Observable.of(this.projects) : this.projectService.GetAll('');
    }

    private getDepartments() {
        this.getDepartmentsObservable().subscribe(departments => {
            super.updateState('departments', departments, false);
        });
    }

    private getDepartmentsObservable() {
        return this.departments ? Observable.of(this.departments) : this.departmentService.GetAll('');
    }

    private getEmployeeLeave(employments: Employment[]) {
        const filterParts = ['EmploymentID eq 0'];
        if (employments) {
            employments.forEach((employment: Employment) => {
                filterParts.push(`EmploymentID eq ${employment.ID}`);
            });
        }

        this.employeeLeaveService.GetAll(`filter=${filterParts.join(' or ')}`).subscribe((response) => {
            super.updateState(EMPLOYEE_LEAVE_KEY, response, false);
        }, err => this.errorService.handle(err));
    }

    private getSubEntities() {
        this.getSubEntitiesObservable().subscribe((response: SubEntity[]) => {
            super.updateState('subEntities', response, false);
        }, err => this.errorService.handle(err));
    }

    private getSubEntitiesObservable(): Observable<SubEntity[]> {
        return this.subEntities
            ? Observable.of(this.subEntities)
            : this.subEntityService.GetAll(null, ['BusinessRelationInfo'])
                .map((subEntities: SubEntity[]) => {
                    return subEntities.length > 1
                        ? subEntities.filter(x => x.SuperiorOrganizationID > 0)
                        : subEntities;
                });
    }

    private getFinancialYearObs() {
        return this.activeYear$.asObservable().take(1);
    }

    private checkForSaveDone(done) {
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                done('Feil ved lagring');
            } else {
                done('Lagring fullført');
                this.checkDirty();
            }
        }
    }

    private triggerSave(type: Type<UniEntity> = null) {
        const saveAction: IUniSaveAction = _.cloneDeep(this.saveActions[0]);
        if (!type) {
            this.toolbar.triggerSaveAction(saveAction);
            return;
        }
        super.updateState(SAVING_KEY, true, false);
        saveAction.action = (done) => {
            this.saveAllObs(done)
                .finally(() => super.updateState(SAVING_KEY, false, false))
                .switchMap(() => this.createNewChildEntityObs(type))
                .subscribe();
        };
        this.toolbar.triggerSaveAction(saveAction);
    }

    private checkSelectedOnChildEntities(list: any[], type: Type<UniEntity>) {
        if (list.find(x => !x.Deleted && x[SELECTED_KEY])) {
            return;
        }
        if (!list.filter(x => !x.Deleted).length) {
            this.createNewChildEntity(type);
            return;
        }
        list.forEach(x => x[SELECTED_KEY] = false);
        this.updateStateWithType(
            type,
            this.markEntityAsSelected(list, list.filter(x => !x.Deleted)[0]),
            list.some(x => x['_isDirty'] || x['Deleted']));
    }

    private createNewChildEntity(type: Type<UniEntity>) {
        this.createNewChildEntityObs(type)
            .subscribe();
    }

    private createNewChildEntityObs(type: Type<UniEntity>) {
        return this.getState(Employee)
            .switchMap(emp => this.employeeDetailsService.newEntity(type, emp))
            .switchMap(element => this.getState(type)
                .map(list => [...list, element || []])
                .map(list => this.markEntityAsSelected(list, element)))
            .do(model => this.updateStateWithType(type, model, model.some(x => x['_isDirty'] || x['Deleted'])));
    }

    private markEntityAsSelected(list: any[], element: any): any[] {
        if (!element) {
            return list;
        }
        return list.map(entity => {
            entity[SELECTED_KEY] = element.ID
                ? entity.ID === element.ID
                : entity._createguid === element._createguid;
            return entity;
        });
    }

    private getState(type: Type<UniEntity>): Observable<any> {
        switch (type) {
            case SalaryBalance:
                return super.getStateSubject(SALARYBALANCES_KEY).take(1);
            case Employee:
                return super.getStateSubject(EMPLOYEE_KEY).take(1);
        }
    }

    private updateStateWithType(type: Type<UniEntity>, model: any, isDirty: boolean = false) {
        switch (type) {
            case SalaryBalance:
                super.updateState(SALARYBALANCES_KEY, model, isDirty);
                break;
        }
    }

    private saveAll(done: (message: string) => void, refreshEmp: boolean = true) {
        super.updateState(SAVING_KEY, true, false);
        this.saveAllObs(done, refreshEmp)
            .finally(() => super.updateState(SAVING_KEY, false, false))
            .subscribe();
    }

    private saveAllObs(done: (message: string) => void, refreshEmp: boolean = true): Observable<any[]> {
        return this.saveEmployee()
            .catch((error, obs) => {
                done('Feil ved lagring');
                return this.errorService.handleRxCatch(error, obs);
            })
            .switchMap(
            (employee) => {

                if (!this.employeeID && refreshEmp) {
                    super.updateState(EMPLOYEE_KEY, this.employee, false);

                    done('Lagring fullført');

                    const childRoute = this.router.url.split('/').pop();
                    this.savedNewEmployee = true;
                    this.router.navigateByUrl(this.url + employee.ID + '/' + childRoute).then(value => {
                        this.savedNewEmployee = false;
                    });
                    return Observable.of([this.employee]);
                }

                // REVISIT: GETing the employee after saving is a bad "fix" but currenctly necessary
                // because response will not contain any new email/address/phone.
                // Anders is looking for a better way to solve this..
                return this.employeeService
                    .get(employee.ID)
                    .catch((err, obs) => {
                        done('Feil ved lagring');
                        return this.errorService.handleRxCatch(err, obs);
                    })
                    .switchMap((emp) => {
                        const obsList: Observable<any>[] = [];
                        if (refreshEmp) {
                            super.updateState(EMPLOYEE_KEY, emp, false);
                        }

                        this.saveStatus = {
                            numberOfRequests: 0,
                            completeCount: 0,
                            hasErrors: false,
                        };

                        if (super.isDirty(EMPLOYMENTS_KEY)) {
                            obsList.push(this.saveEmploymentsObs(done, refreshEmp));
                            this.saveStatus.numberOfRequests++;
                        }

                        if (super.isDirty(RECURRING_POSTS_KEY)) {
                            obsList.push(this.saveRecurringPostsObs(done, refreshEmp));
                            this.saveStatus.numberOfRequests++;
                        }

                        if (super.isDirty(SALARYBALANCES_KEY)) {
                            obsList.push(this.saveSalarybalancesObs(done, refreshEmp));
                            this.saveStatus.numberOfRequests++;
                        }

                        if (super.isDirty(EMPLOYEE_LEAVE_KEY)) {
                            obsList.push(this.saveEmployeeLeaveObs(done, refreshEmp));
                            this.saveStatus.numberOfRequests++;
                        }

                        if (super.isDirty(EMPLOYEE_TAX_KEY)) {
                            obsList.push(this.saveTax(done, refreshEmp));
                            this.saveStatus.numberOfRequests++;
                        }

                        if (!this.saveStatus.numberOfRequests) {
                            this.saveActions[0].disabled = true;
                            done('Lagring fullført');
                        }

                        return Observable.forkJoin(obsList);
                    });
            }
            );
    }

    private saveEmployee(): Observable<Employee> {
        const brInfo = this.employee.BusinessRelationInfo;

        // If employee is untouched and exists in backend we dont have to save it again
        if (!super.isDirty(EMPLOYEE_KEY) && this.employee.ID > 0) {
            return Observable.of(this.employee);
        }

        if (brInfo.DefaultBankAccount
            && (!brInfo.DefaultBankAccount.AccountNumber
                || brInfo.DefaultBankAccount.AccountNumber === '')
        ) {
            brInfo.DefaultBankAccount = null;
            brInfo.DefaultBankAccountID = null;
        }

        if (brInfo.DefaultBankAccount !== null
            && brInfo.DefaultBankAccount !== undefined
            && (!brInfo.DefaultBankAccount.ID || brInfo.DefaultBankAccount.ID === 0)) {
            brInfo.DefaultBankAccount['_createguid'] = this.employeeService.getNewGuid();
        }

        if (brInfo.BankAccounts) {
            brInfo.BankAccounts.forEach(bankaccount => {
                if (bankaccount.ID === 0 || !bankaccount.ID) {
                    bankaccount['_createguid'] = this.bankaccountService.getNewGuid();
                }
            });

            if (brInfo.DefaultBankAccount) {
                brInfo.BankAccounts = brInfo.BankAccounts.filter(x => x !== brInfo.DefaultBankAccount);
            }
        }

        if (brInfo.DefaultBankAccount) {
            brInfo.DefaultBankAccount.BankAccountType = EMPLOYEE_KEY;
        }

        if (brInfo.Emails) {
            brInfo.Emails.forEach((email) => {
                if (!email.ID) {
                    email['_createguid'] = this.employeeService.getNewGuid();
                }
            });
        }
        if (brInfo.Phones) {
            brInfo.Phones.forEach((phone) => {
                if (!phone.ID) {
                    phone['_createguid'] = this.employeeService.getNewGuid();
                }
            });
        }

        if (brInfo.Addresses) {
            brInfo.Addresses.forEach((address) => {
                if (!address.ID) {
                    address['_createguid'] = this.employeeService.getNewGuid();
                }
            });
        }

        if (brInfo.InvoiceAddress && brInfo.InvoiceAddress['_createguid']) {
            brInfo.Addresses = brInfo.Addresses.filter(address => address !== brInfo.InvoiceAddress);
        }

        if (brInfo.DefaultPhone && brInfo.DefaultPhone['_createguid']) {
            brInfo.Phones = brInfo.Phones.filter(phone => phone !== brInfo.DefaultPhone);
        }

        if (brInfo.DefaultEmail && brInfo.DefaultEmail['_createguid']) {
            brInfo.Emails = brInfo.Emails.filter(email => email !== brInfo.DefaultEmail);
        }

        this.employee['_EmployeeSearchResult'] = undefined;

        return (this.employee.ID > 0)
            ? this.employeeService.Put(this.employee.ID, this.employee)
            : this.employeeService.Post(this.employee);
    }

    private saveTax(done: (message: string) => void, updateTaxCard: boolean = true) {
        let year = 0;
        return this.getFinancialYearObs()
            .do(fYear => year = fYear)
            .switchMap(() => super.getStateSubject(EMPLOYEE_TAX_KEY))
            .take(1)
            .switchMap((employeeTaxCard: EmployeeTaxCard) => {
                if (!this.employeeTaxCardService.isEmployeeTaxcard2018Model(employeeTaxCard) || employeeTaxCard.Year < 2018) {
                    return this.employeeTaxCardService.updateModelTo2018(employeeTaxCard, this.employeeID);
                } else {
                    return Observable.of(employeeTaxCard);
                }
            })
            .switchMap((employeeTaxCard: EmployeeTaxCard) => {
                if (employeeTaxCard.Year !== year) {
                    employeeTaxCard.ID = undefined;
                    employeeTaxCard.Year = year;
                }
                this.employeeTaxCardService.setNumericValues(employeeTaxCard, year);
                if (employeeTaxCard.ID === 0 || !employeeTaxCard.ID) {
                    employeeTaxCard['_createguid'] = this.employeeTaxCardService.getNewGuid();
                }

                if (employeeTaxCard) {
                    return employeeTaxCard.ID
                        ? this.employeeTaxCardService.Put(employeeTaxCard.ID, employeeTaxCard)
                        : this.employeeTaxCardService.Post(employeeTaxCard);
                } else {
                    return Observable.of(undefined);
                }
            })
            .catch((err, obs) => {
                this.saveStatus.hasErrors = true;
                return this.errorService.handleRxCatch(err, obs);
            })
            .finally(() => {
                this.saveStatus.completeCount++;
                this.checkForSaveDone(done);
            })
            .do(updatedTaxCard => {
                if (updatedTaxCard && updateTaxCard) {
                    super.updateState(EMPLOYEE_TAX_KEY, updatedTaxCard, false);
                }
            });
    }

    private saveEmploymentsObs(done, updateEmployments: boolean = true): Observable<Employment[]> {
        return super.getStateSubject(EMPLOYMENTS_KEY)
            .take(1)
            .switchMap((employments: Employment[]) => {
                const changes = [];
                let hasStandard = false;

                // Build changes array consisting of only changed employments
                // Check for standard employment
                employments.forEach((employment) => {
                    if (employment.Standard) {
                        hasStandard = true;
                    }

                    if (employment['_isDirty']) {
                        employment.EmployeeID = this.employee.ID;
                        employment.EmployeeNumber = this.employee.EmployeeNumber;

                        if (!employment.DimensionsID && employment.Dimensions) {
                            employment.Dimensions['_createguid'] = this.employmentService.getNewGuid();
                        }

                        employment.MonthRate = employment.MonthRate || 0;
                        employment.HourRate = employment.HourRate || 0;
                        employment.UserDefinedRate = employment.UserDefinedRate || 0;
                        employment.WorkPercent = employment.WorkPercent || 0;
                        employment.HoursPerWeek = employment.HoursPerWeek || 0;

                        changes.push(employment);
                    }
                });

                if (!hasStandard) {
                    changes[0].Standard = true;
                }

                // Save employments by using complex put on employee
                const employee = _.cloneDeep(this.employee);
                employee.Employments = changes;

                employee.Employments.forEach(employment => {
                    const keys = Object.keys(employment);
                    keys.forEach(key => {
                        if (employment[key] === undefined) {
                            employment[key] = null; // don't know why undefined values are not mapped in the http call
                        }
                    });
                });

                return this.employeeService
                    .Put(employee.ID, employee)
                    .catch((err, obs) => {
                        this.saveStatus.hasErrors = true;
                        return this.errorService.handleRxCatch(err, obs);
                    })
                    .finally(() => {
                        this.saveStatus.completeCount++;
                        this.checkForSaveDone(done);
                    })
                    .do(
                    () => {
                        if (updateEmployments) {
                            this.getEmployments();
                        }
                    })
                    .map((emp: Employee) => {
                        return emp.Employments;
                    });
            });
    }

    private saveSalarybalancesObs(done, updateSalarybalances: boolean = true): Observable<SalaryBalance[]> {
        this.salaryBalanceLineService.invalidateCache();
        return super.getStateSubject(SALARYBALANCES_KEY)
            .take(1)
            .switchMap((salarybalances: SalaryBalance[]) => {
                const obsList: Observable<SalaryBalance>[] = [];
                let changeCount = 0;
                let saveCount = 0;
                let hasErrors = false;

                salarybalances
                    .forEach((salarybalance, index) => {
                        if (!salarybalance['_isDirty'] && !salarybalance.Deleted) {
                            return;
                        }
                        changeCount++;
                        salarybalance.EmployeeID = this.employee.ID;

                        const newObs: Observable<SalaryBalance> = this.handleSalaryBalanceUpdate(salarybalance)
                            .catch((err, obs) => {
                                hasErrors = true;
                                salarybalances[index].Deleted = false;
                                const toastHeader =
                                    `Feil ved lagring av trekk linje ${salarybalance['_originalIndex'] + 1}`;
                                const toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                                this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                                return this.errorService.handleRxCatch(err, obs);
                            })
                            .switchMap((res: SalaryBalance) => {
                                if (!res.ID || res.Deleted) {
                                    return Observable.of(res);
                                }
                                return this.salaryBalanceLineService
                                    .GetAll(`filter=SalaryBalanceID eq ${res.ID}`, ['SalaryTransaction.payrollrun'])
                                    .map(lines => {
                                        res.Transactions = lines;
                                        return res;
                                    });
                            })
                            .do((res: SalaryBalance) => {
                                if (!res.ID || res.Deleted) {
                                    return;
                                }
                                res[SELECTED_KEY] = salarybalances[index][SELECTED_KEY];
                                salarybalances[index] = res;
                            })
                            .finally(() => {
                                saveCount++;
                                if (saveCount === changeCount) {
                                    this.saveStatus.completeCount++;
                                    if (hasErrors) {
                                        this.saveStatus.hasErrors = true;
                                    }
                                    if (updateSalarybalances) {
                                        super.updateState(SALARYBALANCES_KEY,
                                            salarybalances.filter(x => !x.Deleted),
                                            salarybalances.some(salbal => salbal['_isDirty']));
                                    }

                                    this.checkForSaveDone(done);
                                }
                            });

                        obsList.push(newObs);
                    });
                return Observable.forkJoin(obsList);
            });
    }

    private handleSalaryBalanceUpdate(salaryBalance: SalaryBalance): Observable<SalaryBalance> {
        if (salaryBalance.Deleted) {
            return this.salarybalanceService.Remove(salaryBalance.ID).map(() => salaryBalance);
        }
        return this.salaryBalanceViewService.save(salaryBalance);
    }

    private saveRecurringPostsObs(done, updatePosts: boolean = true): Observable<SalaryTransaction[]> {
        return super.getStateSubject(RECURRING_POSTS_KEY)
            .take(1)
            .switchMap((recurringPosts: SalaryTransaction[]) => {
                const obsList: Observable<SalaryTransaction>[] = [];
                let changeCount = 0;
                let saveCount = 0;
                let hasErrors = false;

                recurringPosts
                    .forEach((post, index) => {
                        if (post['_isDirty'] || post.Deleted) {
                            changeCount++;

                            post.IsRecurringPost = true;
                            post.EmployeeID = this.employee.ID;
                            post.EmployeeNumber = this.employee.EmployeeNumber;

                            if (post.Supplements) {
                                post.Supplements
                                    .filter(x => !x.ID)
                                    .forEach((supplement: SalaryTransactionSupplement) => {
                                        supplement['_createguid'] = this.salaryTransService.getNewGuid();
                                    });
                            }

                            if (post.Dimensions && !post.DimensionsID) {
                                if (Object.keys(post.Dimensions)
                                    .filter(x => x.indexOf('ID') > -1)
                                    .some(key => post.Dimensions[key])) {
                                    post.Dimensions['_createguid'] = this.salaryTransService.getNewGuid();
                                } else {
                                    post.Dimensions = null;
                                }

                            }
                            const source = (post.ID > 0)
                                ? this.salaryTransService.Put(post.ID, post)
                                : this.salaryTransService.Post(post);

                            const newObs: Observable<SalaryTransaction> = <Observable<SalaryTransaction>>source
                                .switchMap(trans => {
                                    return Observable.forkJoin(
                                        Observable.of(trans),
                                        this.getProjectsObservable(),
                                        this.getDepartmentsObservable(),
                                        this.getDimension(trans),
                                        this.getWageTypesObservable());
                                })
                                .map((
                                    response: [SalaryTransaction, Project[], Department[], Dimensions, WageType[]]
                                ) => {
                                    const [trans, projects, departments, dimensions, wageTypes] = response;
                                    trans.Dimensions = dimensions;
                                    if (trans.Dimensions) {
                                        trans['_Project'] = projects
                                            .find(x => x.ID === trans.Dimensions.ProjectID);
                                        trans['_Department'] = departments
                                            .find(x => x.ID === trans.Dimensions.DepartmentID);
                                    }
                                    trans['_WageType'] = wageTypes.find(wt => wt.ID === trans.WageTypeID);
                                    return <SalaryTransaction>trans;
                                })
                                .finally(() => {
                                    saveCount++;
                                    if (saveCount === changeCount) {
                                        this.saveStatus.completeCount++;
                                        if (hasErrors) {
                                            this.saveStatus.hasErrors = true;
                                        }
                                        if (updatePosts) {
                                            super.updateState(RECURRING_POSTS_KEY,
                                                recurringPosts.filter(x => !x.Deleted),
                                                recurringPosts.some(trans => trans['_isDirty']));
                                        }

                                        this.checkForSaveDone(done);
                                    }
                                })
                                .catch((err, obs) => {
                                    hasErrors = true;
                                    recurringPosts[index].Deleted = false;
                                    const toastHeader =
                                        `Feil ved lagring av faste poster linje ${post['_originalIndex'] + 1}`;
                                    const toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                                    this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                                    this.errorService.handle(err);
                                    return Observable.empty();
                                })
                                .map(
                                (res: SalaryTransaction) => {
                                    recurringPosts[index] = res;
                                    return res;
                                });

                            obsList.push(newObs);
                        }
                    });
                return Observable.forkJoin(obsList);
            });
    }

    private getDimension(post: SalaryTransaction): Observable<Dimensions> {
        if (post.DimensionsID) {
            if (post['Dimensions']) {
                return Observable.of(post.Dimensions);
            }

            return this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint('/dimensions/' + post.DimensionsID)
                .send()
                .map(response => response.json());
        }

        return Observable.of(null);
    }

    private saveEmployeeLeaveObs(done, updateEmployeeLeave: boolean = true): Observable<EmployeeLeave[]> {
        return super.getStateSubject(EMPLOYEE_LEAVE_KEY)
            .take(1)
            .switchMap((employeeLeave: EmployeeLeave[]) => {
                const obsList: Observable<EmployeeLeave>[] = [];
                let changeCount = 0;
                let saveCount = 0;
                let hasErrors = false;

                employeeLeave.forEach((leave) => {
                    if (leave['_isDirty'] || leave.Deleted) {
                        changeCount++;

                        const source = (leave.ID > 0)
                            ? this.employeeLeaveService.Put(leave.ID, leave)
                            : this.employeeLeaveService.Post(leave);

                        // Check if we are done saving all employeeLeave items
                        const newObs = source.finally(() => {
                            if (saveCount === changeCount) {
                                this.saveStatus.completeCount++;
                                // If we have errors, indicate this in the main save status
                                // if not, update employeeLeave cache and set dirty to false
                                if (hasErrors) {
                                    this.saveStatus.hasErrors = true;
                                } else if (updateEmployeeLeave) {
                                    super.updateState(EMPLOYEE_LEAVE_KEY, employeeLeave, false);
                                }
                                this.checkForSaveDone(done); // check if all save functions are finished
                            }
                        })
                            .catch((err, obs) => {
                                leave.Deleted = false;
                                hasErrors = true;
                                saveCount++;
                                return this.errorService.handleRxCatch(err, obs);
                            })
                            .do((res: EmployeeLeave) => {
                                leave = res;
                                saveCount++;
                            });
                        obsList.push(newObs);
                    }
                });

                return Observable.forkJoin(obsList);
            });
    }

    private populateCategoryFilters(categories) {
        this.categoryFilter = categories.map(x => {
            return {linkID: x.ID, title: x.Name};
        });
    }

}
