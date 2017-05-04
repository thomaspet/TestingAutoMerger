import { Component, ViewChild, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {
    Employee, Employment, EmployeeLeave, SalaryTransaction, Project, Dimensions,
    Department, SubEntity, SalaryTransactionSupplement, EmployeeTaxCard,
    WageType, EmployeeCategory, BusinessRelation
} from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig, IAutoCompleteConfig } from '../../common/toolbar/toolbar';
import { IPosterWidget } from '../../common/poster/poster';
import { UniHttp } from '../../../../framework/core/http/http';
import { UniView } from '../../../../framework/core/uniView';
import { TaxCardModal } from './modals/taxCardModal';
import { UniConfirmModal, ConfirmActions } from '../../../../framework/modals/confirm';
import {
    EmployeeService, EmploymentService, EmployeeLeaveService, DepartmentService, ProjectService,
    SalaryTransactionService, UniCacheService, SubEntityService, EmployeeTaxCardService, ErrorService,
    NumberFormat, WageTypeService, SalarySumsService, YearService, BankAccountService, EmployeeCategoryService,
    ModulusService
} from '../../../services/services';
declare var _;
@Component({
    selector: 'uni-employee-details',
    templateUrl: './employeeDetails.html'
})
export class EmployeeDetails extends UniView implements OnDestroy {

    public busy: boolean;
    private url: string = '/salary/employees/';
    private childRoutes: any[];
    private saveStatus: { numberOfRequests: number, completeCount: number, hasErrors: boolean };

    private employeeID: number;
    private employee: Employee;
    private posterEmployee: any = {};
    private employments: Employment[];
    private recurringPosts: SalaryTransaction[];
    private employeeLeave: EmployeeLeave[];
    private subEntities: SubEntity[];
    private projects: Project[];
    private departments: Department[];
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private employeeTaxCard: EmployeeTaxCard;
    private wageTypes: WageType[] = [];
    private activeYear: number;
    private categories: EmployeeCategory[];
    private savedNewEmployee: boolean;

    public categoryFilter: any[] = [];
    public tagConfig: any = {
        description: 'Utvalg ',
        helpText: 'Kategorier på ansatt: ',
        truncate: 20
    };

    @ViewChild(TaxCardModal) public taxCardModal: TaxCardModal;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

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
                mainText: { text: '' },
            }
        }
    ];

    private employeeSearch: IAutoCompleteConfig;


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
        private modulusService: ModulusService
    ) {
        super(router.url, cacheService);

        this.childRoutes = [
            { name: 'Detaljer', path: 'personal-details' },
            { name: 'Arbeidsforhold', path: 'employments' },
            { name: 'Faste poster', path: 'recurring-post' },
            { name: 'Permisjon', path: 'employee-leave' }
        ];

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

        this.yearService.getActiveYear()
            .subscribe((year) => {
                this.activeYear = year;
            }, err => this.errorService.handle(err));

        this.route.params.subscribe((params) => {
            this.employeeID = +params['id'];
            this.tagConfig.readOnly = !this.employeeID;

            if (!this.employeeID) {
                // If we're dealing with a new employee, just fire up an empty state poster
                this.employeeWidgets = [
                    {
                        type: 'contact',
                        config: {
                            contacts: [{ value: 'Ny ansatt' }]
                        }
                    },
                    {
                        type: 'text',
                        size: 'small',
                        config: {
                            topText: [{ text: 'Ingen lønn utbetalt' }]
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
                            topText: [{ text: 'Ingen aktive stillingsforhold' }]
                        }
                    }
                ];
            }

            // Update cache key and clear data variables when employee ID is changed
            super.updateCacheKey(this.router.url);

            this.employments = undefined;
            this.employeeLeave = undefined;
            this.recurringPosts = undefined;
            this.employeeTaxCard = undefined;
            this.categories = undefined;

            // (Re)subscribe to state var updates
            super.getStateSubject('employee').subscribe((employee) => {
                this.employee = employee;
                this.posterEmployee.employee = employee;
                this.posterEmployee = _.cloneDeep(this.posterEmployee);
                this.toolbarConfig = {
                    title: employee.BusinessRelationInfo ? employee.BusinessRelationInfo.Name || 'Ny ansatt' : 'Ny ansatt',
                    subheads: [{
                        title: this.employee.ID ? 'Ansattnr. ' + this.employee.ID : ''
                    }],
                    navigation: {
                        prev: this.previousEmployee.bind(this),
                        next: this.nextEmployee.bind(this),
                        add: this.newEmployee.bind(this)
                    }
                };

                this.saveActions = [{
                    label: 'Lagre',
                    action: this.saveAll.bind(this),
                    main: true,
                    disabled: true
                }];
                this.updatePosterEmployee(this.employee);
                this.checkDirty();
            }, err => this.errorService.handle(err));

            super.getStateSubject('employments').subscribe((employments) => {
                this.employments = employments;
                this.posterEmployee.employments = employments;
                this.posterEmployee = _.cloneDeep(this.posterEmployee);
                this.checkDirty();
                if (this.employeeID) {
                    this.updatePosterEmployments(employments);
                }
            }, err => this.errorService.handle(err));

            super.getStateSubject('recurringPosts').subscribe((recurringPosts) => {
                this.recurringPosts = recurringPosts;
                this.checkDirty();
            }, err => this.errorService.handle(err));

            super.getStateSubject('employeeLeave').subscribe((employeeLeave) => {
                this.employeeLeave = employeeLeave;
                this.checkDirty();
            }, err => this.errorService.handle(err));

            super.getStateSubject('subEntities').subscribe((subEntities: SubEntity[]) => {
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

            super.getStateSubject('employeeTaxCard').subscribe((employeeTaxCard) => {
                this.employeeTaxCard = employeeTaxCard;
                this.updateTaxAlerts(employeeTaxCard);
                this.checkDirty();
            });


            // If employee ID was changed by next/prev button clicks employee has been
            // pre-loaded. No need to clear and refresh in these cases
            if (this.employee && this.employee.ID === +params['id']) {
                super.updateState('employee', this.employee, false);
            } else {
                this.employee = undefined;
            }

            // Update navbar tabs
            this.updateTabStrip(this.employeeID, this.employee);
        });

        // Subscribe to route changes and load necessary data
        this.router.events.subscribe((event: any) => {
            if (event instanceof NavigationEnd && this.employeeID !== undefined) {
                let childRoute = event.url.split('/').pop();
                if (!this.employee) {
                    this.getEmployee();
                }

                if (!this.categories) {
                    this.getEmployeeCategories();
                }

                if (!this.employeeTaxCard) {
                    this.getTax();
                }

                if (!this.employments) {
                    this.getEmployments();
                    this.getProjects();
                    this.getDepartments();
                }

                if (childRoute === 'recurring-post') {
                    if (!this.recurringPosts) {
                        this.getRecurringPosts();
                    }
                }

                if (childRoute === 'employee-leave') {
                    if (!this.employeeLeave) {
                        super.getStateSubject('employments').take(1).subscribe(() => {
                            this.getEmployeeLeave();
                        });
                    }
                }

                if (childRoute !== 'employee-leave' && childRoute !== 'recurring-post') {
                    this.getSubEntities();
                }
            }
        });
    }

    private updateTabStrip(employeeID: number, employee: Employee) {
        if (employeeID) {
            this.tabService.addTab({
                name: 'Ansattnr. ' + (employee ? employee.EmployeeNumber : employeeID),
                url: this.url + employeeID,
                moduleID: UniModules.Employees,
                active: true
            });
        } else {
            this.tabService.addTab({
                name: 'Ny ansatt',
                url: this.url + employeeID,
                moduleID: UniModules.Employees,
                active: true
            });
        }
    }

    public ngOnDestroy() {
        this.employeeID = undefined;
    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty() || this.savedNewEmployee)
            .switchMap(result => {
                return result
                    ? Observable.of(result)
                    : Observable
                        .fromPromise(
                        this.confirmModal.confirmSave())
                        .map((response: ConfirmActions) => {
                            if (response === ConfirmActions.ACCEPT) {
                                this.saveAll((m) => { }, false);
                                return true;
                            } else {
                                return response === ConfirmActions.REJECT;
                            }
                        });
            })
            .map(canDeactivate => {
                canDeactivate
                    ? this.cacheService.clearPageCache(this.cacheKey)
                    : this.updateTabStrip(this.employeeID, this.employee);

                return canDeactivate;
            });
    }

    public updatePosterEmployee(employee: Employee) {
        if (employee.ID !== 0) {

            // Scaffold our employee widgets
            let posterContact = {
                type: 'contact',
                config: {
                    contacts: []
                }
            },
                posterSalary = {
                    type: 'text',
                    config: {
                        topText: [
                            { text: 'Nettolønn', class: 'large' },
                            { text: 'utbetalt hittil i år', class: 'small' }
                        ],
                        mainText: { text: '' }
                    }
                };

            // Add email, if any
            if (employee.BusinessRelationInfo.Emails && employee.BusinessRelationInfo.Emails[0]) {
                posterContact.config.contacts.push({ value: employee.BusinessRelationInfo.Emails[0].EmailAddress });
            }
            // Add phone number, if any
            if (employee.BusinessRelationInfo.Phones && employee.BusinessRelationInfo.Phones[0]) {
                posterContact.config.contacts.push({ value: employee.BusinessRelationInfo.Phones[0].Number });
            }

            // Activate the contact widget
            this.employeeWidgets[0] = posterContact;

            if (employee.ID) {
                this.salarySumsService
                    .getSumsInYear(this.activeYear, this.employeeID)
                    .subscribe((data) => {
                        if (data.netPayment) {
                            let add = Math.floor(data.netPayment / 80);
                            let netPaidThisYear: number = 0;
                            let interval = setInterval(() => {
                                netPaidThisYear += add;
                                posterSalary.config.mainText.text = this.numberformat.asMoney(netPaidThisYear);
                                if (netPaidThisYear >= data.netPayment) {
                                    clearInterval(interval);
                                    posterSalary.config.mainText.text = this.numberformat.asMoney(data.netPayment);
                                }
                                this.employeeWidgets[1] = posterSalary;
                            }, 10);
                        } else {
                            posterSalary.config.mainText.text = this.numberformat.asMoney(data.netPayment);
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
        let employmentWidget = {
            type: 'text',
            config: {
                topText: [{ text: '', class: 'large' }],
                mainText: { text: '' },
                bottomText: [{ text: '' }]
            }
        };

        // Add employments
        if (employments.length > 0) {
            var standardIndex = 0;
            var actives = 0;
            for (var i = 0; i < employments.length; i++) {
                let active = !employments[i].EndDate || new Date(employments[i].EndDate) > new Date();
                if (active && employments[i].WorkPercent > 0) {
                    actives++;
                }
                if (employments[i].Standard && employments[i].WorkPercent > 0) {
                    standardIndex = i;
                }
            }
            if (actives > 0) {
                employmentWidget.config.topText[0].text = employments[standardIndex].JobName;

                employmentWidget.config.mainText.text =
                    this.numberformat.asPercentage(employments[standardIndex].WorkPercent);

                if (actives > 1) {
                    employmentWidget.config.bottomText[0].text = '+' + (actives - 1) +
                        (actives > 2 ? ' stillinger' : ' stilling');
                }
            } else {
                employmentWidget.config.bottomText[0].text = 'Ingen aktive stillingsforhold';
            }

        }

        // Send the widget to the poster
        this.employeeWidgets[3] = employmentWidget;
    }

    private updateEmployeeAlerts(employee: Employee) {
        let alerts = this.employeeWidgets[2].config.alerts;
        let checks = this.employeeBoolChecks(employee);

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
        let alerts = this.employeeWidgets[2].config.alerts;
        this.yearService.getActiveYear()
            .subscribe((year: number) => {
                this.activeYear = year;
                let checks = this.taxBoolChecks(employeeTaxCard, this.activeYear);
                // Tax info ok?
                alerts[1] = {
                    text: checks.hasTaxCard
                        ? (checks.taxCardIsUpToDate
                            ? 'Skattekort ok'
                            : 'Skattekortet er ikke oppdatert')
                        : 'Skattekort mangler',
                    class: checks.hasTaxCard && checks.taxCardIsUpToDate
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
    private employeeBoolChecks(employee: Employee): { hasSSN: boolean, hasAccountNumber: boolean } {
        return {
            hasSSN: this.modulusService.validSSN(employee.SocialSecurityNumber),
            hasAccountNumber: employee.BusinessRelationInfo.DefaultBankAccountID !== null
        };
    }

    private taxBoolChecks(employeeTaxCard: EmployeeTaxCard, year): { hasTaxCard: any, taxCardIsUpToDate: boolean } {
        return {
            hasTaxCard: employeeTaxCard && (employeeTaxCard.TaxPercentage || employeeTaxCard.TaxTable),
            taxCardIsUpToDate: employeeTaxCard && employeeTaxCard.Year === year
        };
    }

    public nextEmployee() {

        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.employeeService.getNext(this.employee.ID).subscribe((next: Employee) => {
                    if (next) {
                        this.employee = next;
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }

    public previousEmployee() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.employeeService.getPrevious(this.employee.ID).subscribe((prev: Employee) => {
                    if (prev) {
                        this.employee = prev;
                        let childRoute = this.router.url.split('/').pop();
                        this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
                    }
                }, err => this.errorService.handle(err));
            }
        });
    }

    public newEmployee() {
        this.canDeactivate().subscribe(canDeactivate => {
            if (canDeactivate) {
                this.employeeService.get(0).subscribe((emp: Employee) => {
                    this.employee = emp;
                    let childRoute = this.router.url.split('/').pop();
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
                super.updateState('employee', employee, false);
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
            .subscribe(taxCard => {
                super.updateState('employeeTaxCard', taxCard, false);
                super.updateState('taxCardModalCallback',
                    { openModal: () => this.taxCardModal.openModal() },
                    false);
            });
    }

    private getTaxObservable(): Observable<EmployeeTaxCard> {
        return this.getFinancialYearObs()
            .switchMap(financialYear => this.employeeTaxCardService
                .GetTaxCard(this.employeeID, this.activeYear))
            .switchMap(taxCard => {
                return taxCard
                    ? Observable.of(taxCard)
                    : this.employeeTaxCardService
                        .GetNewEntity(null, 'EmployeeTaxCard')
                        .map((response: EmployeeTaxCard) => {
                            response.EmployeeID = this.employeeID;
                            return response;
                        });
            })
            .map(taxCard => {
                if (!taxCard.TaxPercentage) {
                    taxCard.TaxPercentage = undefined;
                }
                if (!taxCard.NonTaxableAmount) {
                    taxCard.NonTaxableAmount = undefined;
                }
                return taxCard;
            });
    }

    private getEmployments() {
        this.getEmploymentsObservable()
            .subscribe((employments) => {
                super.updateState('employments', employments, false);
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

    private getRecurringPosts() {
        let filter = `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`;
        Observable.forkJoin(
            this.salaryTransService.GetAll('filter=' + filter, ['Supplements.WageTypeSupplement', 'Dimensions']),
            this.getProjectsObservable(),
            this.getDepartmentsObservable(),
            this.getWageTypesObservable(),
            this.getEmploymentsObservable(true))
            .subscribe((response: [SalaryTransaction[], Project[], Department[], WageType[], Employment[]]) => {
                let [transes, projects, departments, wageTypes, employments] = response;

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
                super.updateState('recurringPosts', transes, false);
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

    private getEmployeeLeave() {
        let filterParts = ['EmploymentID eq 0'];
        if (this.employments) {
            this.employments.forEach((employment: Employment) => {
                filterParts.push(`EmploymentID eq ${employment.ID}`);
            });
        }

        this.employeeLeaveService.GetAll(`filter=${filterParts.join(' or ')}`).subscribe((response) => {
            super.updateState('employeeLeave', response, false);
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
        return this.yearService
            ? Observable.of(this.activeYear)
            : this.yearService.getActiveYear();
    }

    private checkForSaveDone(done) {
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                done('Feil ved lagring');
            } else {
                done('Lagring fullført');
                this.saveActions[0].disabled = true;
            }
        }
    }

    private saveAll(done: (message: string) => void, refreshEmp: boolean = true) {
        this.saveEmployee().subscribe(
            (employee) => {

                if (!this.employeeID && refreshEmp) {
                    super.updateState('employee', this.employee, false);

                    done('Lagring fullført');

                    let childRoute = this.router.url.split('/').pop();
                    this.savedNewEmployee = true;
                    this.router.navigateByUrl(this.url + employee.ID + '/' + childRoute).then(value => {
                        this.savedNewEmployee = false;
                    });
                    return;
                }

                // REVISIT: GETing the employee after saving is a bad "fix" but currenctly necessary
                // because response will not contain any new email/address/phone.
                // Anders is looking for a better way to solve this..
                this.employeeService.get(this.employeeID).subscribe((emp) => {
                    if (refreshEmp) {
                        super.updateState('employee', emp, false);
                    }

                    // super.updateState('employee', employee, false);

                    this.saveStatus = {
                        numberOfRequests: 0,
                        completeCount: 0,
                        hasErrors: false,
                    };

                    if (super.isDirty('employments')) {
                        this.saveEmployments(done, refreshEmp);
                        this.saveStatus.numberOfRequests++;
                    }

                    if (super.isDirty('recurringPosts')) {
                        this.saveRecurringPosts(done, refreshEmp);
                        this.saveStatus.numberOfRequests++;
                    }

                    if (super.isDirty('employeeLeave')) {
                        this.saveEmployeeLeave(done, refreshEmp);
                        this.saveStatus.numberOfRequests++;
                    }

                    if (super.isDirty('employeeTaxCard')) {
                        this.saveTax(done, refreshEmp);
                        this.saveStatus.numberOfRequests++;
                    }

                    if (!this.saveStatus.numberOfRequests) {
                        this.saveActions[0].disabled = true;
                        done('Lagring fullført');
                    }
                });
            },
            (error) => {
                done('Feil ved lagring');
                this.errorService.handle(error);
            }
        );
    }

    private saveEmployee(): Observable<Employee> {
        let brInfo = this.employee.BusinessRelationInfo;

        // If employee is untouched and exists in backend we dont have to save it again
        if (!super.isDirty('employee') && this.employee.ID > 0) {
            return Observable.of(this.employee);
        }

        if (brInfo.DefaultBankAccount && (!brInfo.DefaultBankAccount.AccountNumber || brInfo.DefaultBankAccount.AccountNumber === '')) {
            brInfo.DefaultBankAccount = null;
            brInfo.DefaultBankAccountID = null;
        }

        if (brInfo.DefaultBankAccount !== null && brInfo.DefaultBankAccount !== undefined && (!brInfo.DefaultBankAccount.ID || brInfo.DefaultBankAccount.ID === 0)) {
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
            brInfo.DefaultBankAccount.BankAccountType = 'employee';
        }

        brInfo.Emails.forEach((email) => {
            if (!email.ID) {
                email['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        brInfo.Phones.forEach((phone) => {
            if (!phone.ID) {
                phone['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        brInfo.Addresses.forEach((address) => {
            if (!address.ID) {
                address['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        if (brInfo.InvoiceAddress && brInfo.InvoiceAddress['_createguid']) {
            brInfo.Addresses = brInfo.Addresses.filter(address => address !== brInfo.InvoiceAddress);
        }

        if (brInfo.DefaultPhone && brInfo.DefaultPhone['_createguid']) {
            brInfo.Phones = brInfo.Phones.filter(phone => phone !== brInfo.DefaultPhone);
        }

        if (brInfo.DefaultEmail && brInfo.DefaultEmail['_createguid']) {
            brInfo.Emails = brInfo.Emails.filter(email => email !== brInfo.DefaultEmail);
        }

        return (this.employee.ID > 0)
            ? this.employeeService.Put(this.employee.ID, this.employee)
            : this.employeeService.Post(this.employee);
    }

    private saveTax(done: (message: string) => void, updateTaxCard: boolean = true) {
        super.getStateSubject('employeeTaxCard')
            .take(1)
            .switchMap((employeeTaxCard: EmployeeTaxCard) => {
                if (employeeTaxCard.Year !== this.activeYear) {
                    employeeTaxCard.ID = undefined;
                    employeeTaxCard.Year = this.activeYear;
                }

                if (employeeTaxCard && updateTaxCard) {
                    return employeeTaxCard.ID
                        ? this.employeeTaxCardService.Put(employeeTaxCard.ID, employeeTaxCard)
                        : this.employeeTaxCardService.Post(employeeTaxCard);
                } else {
                    return Observable.of(undefined);
                }
            })
            .finally(() => {
                this.saveStatus.completeCount++;
                this.checkForSaveDone(done);
            })
            .subscribe(updatedTaxCard => {
                if (updatedTaxCard) {
                    super.updateState('employeeTaxCard', updatedTaxCard, false);
                }
            },
            err => {
                this.errorService.handle(err);
                this.saveStatus.hasErrors = true;
            });
    }

    private saveEmployments(done, updateEmployments: boolean = true) {
        super.getStateSubject('employments').take(1).subscribe((employments: Employment[]) => {
            let changes = [];
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
            let employee = _.cloneDeep(this.employee);
            employee.Employments = changes;

            employee.Employments.forEach(employment => {
                const keys = Object.keys(employment);
                keys.forEach(key => {
                    if (employment[key] === undefined) {
                        employment[key] = null; // don't know why undefined values are not mapped in the http call
                    }
                });
            });

            this.employeeService.Put(employee.ID, employee)
                .finally(() => {
                    this.saveStatus.completeCount++;
                    this.checkForSaveDone(done);
                })
                .subscribe(
                (res) => {
                    if (updateEmployments) {
                        this.getEmployments();
                    }
                },
                (err) => {
                    this.saveStatus.hasErrors = true;

                    let toastHeader = 'Noe gikk galt ved lagring av arbeidsforhold';
                    let toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                    this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                }
                );
        }, err => this.errorService.handle(err));
    }

    private saveRecurringPosts(done, updatePosts: boolean = true) {
        super.getStateSubject('recurringPosts')
            .take(1)
            .subscribe((recurringPosts: SalaryTransaction[]) => {
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
                            let source = (post.ID > 0)
                                ? this.salaryTransService.Put(post.ID, post)
                                : this.salaryTransService.Post(post);

                            source
                                .switchMap(trans => {
                                    return Observable.forkJoin(
                                        Observable.of(trans),
                                        this.getProjectsObservable(),
                                        this.getDepartmentsObservable(),
                                        this.getDimension(trans),
                                        this.getWageTypesObservable());
                                })
                                .map((response: [SalaryTransaction, Project[], Department[], Dimensions, WageType[]]) => {
                                    let [trans, projects, departments, dimensions, wageTypes] = response;
                                    trans.Dimensions = dimensions;
                                    if (trans.Dimensions) {
                                        trans['_Project'] = projects
                                            .find(x => x.ID === trans.Dimensions.ProjectID);
                                        trans['_Department'] = departments
                                            .find(x => x.ID === trans.Dimensions.DepartmentID);
                                    }
                                    trans['_WageType'] = wageTypes.find(wt => wt.ID === trans.WageTypeID);
                                    return trans;
                                })
                                .finally(() => {
                                    saveCount++;
                                    if (saveCount === changeCount) {
                                        this.saveStatus.completeCount++;
                                        if (hasErrors) {
                                            this.saveStatus.hasErrors = true;
                                        }
                                        if (updatePosts) {
                                            super.updateState('recurringPosts',
                                                recurringPosts.filter(x => !x.Deleted),
                                                recurringPosts.some(trans => trans['_isDirty']));
                                        }

                                        this.checkForSaveDone(done);
                                    }
                                })
                                .subscribe(
                                (res: SalaryTransaction) => {
                                    recurringPosts[index] = res;
                                },
                                (err) => {
                                    hasErrors = true;
                                    recurringPosts[index].Deleted = false;
                                    let toastHeader =
                                        `Feil ved lagring av faste poster linje ${post['_originalIndex'] + 1}`;
                                    let toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                                    this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                                    this.errorService.handle(err);
                                }
                                );
                        }
                    });
            }, err => this.errorService.handle(err));
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

    private saveEmployeeLeave(done, updateEmployeeLeave: boolean = true) {
        super.getStateSubject('employeeLeave').take(1).subscribe((employeeLeave: EmployeeLeave[]) => {
            let changeCount = 0;
            let saveCount = 0;
            let hasErrors = false;

            employeeLeave.forEach((leave) => {
                if (leave['_isDirty'] || leave.Deleted) {
                    changeCount++;

                    let source = (leave.ID > 0)
                        ? this.employeeLeaveService.Put(leave.ID, leave)
                        : this.employeeLeaveService.Post(leave);

                    // Check if we are done saving all employeeLeave items
                    source.finally(() => {
                        if (saveCount === changeCount) {
                            this.saveStatus.completeCount++;
                            // If we have errors, indicate this in the main save status
                            // if not, update employeeLeave cache and set dirty to false
                            if (hasErrors) {
                                this.saveStatus.hasErrors = true;
                            } else if (updateEmployeeLeave) {
                                super.updateState('employeeLeave', employeeLeave, false);
                            }
                            this.checkForSaveDone(done); // check if all save functions are finished
                        }
                    })
                        .subscribe(
                        (res: EmployeeLeave) => {
                            leave = res;
                            saveCount++;
                        },
                        (err) => {
                            leave.Deleted = false;
                            hasErrors = true;
                            saveCount++;
                            this.errorService.handle(err);
                        }
                        );
                }
            });
        }, err => this.errorService.handle(err));
    }

    private populateCategoryFilters(categories) {
        this.categoryFilter = categories.map(x => {
            return { id: x.ID, title: x.Name };
        });
        this.tagConfig.description = this.categoryFilter.length ? 'Utvalg: ' : 'Utvalg';
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
                .map(x => this.employeeService
                    .saveEmployeeCategory(this.employeeID, x)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs)))
                .concat(categoriesToDelete
                    .map(x => this.employeeService
                        .deleteEmployeeCategory(this.employeeID, x)
                        .catch((err, obs) => this.errorService.handleRxCatch(err, obs))));

            return saveObs.length ? Observable.forkJoin(saveObs) : Observable.of(null);
        })
            .subscribe(
            x => this.getEmployeeCategories(),
            err => this.errorService.handle(err));
    }

}
