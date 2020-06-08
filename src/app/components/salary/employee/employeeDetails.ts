import {Component, ViewChild, OnDestroy, Type} from '@angular/core';
import {Observable, of, from, forkJoin} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {
    Employee, Employment, EmployeeLeave, SalaryTransaction, Project, Dimensions,
    Department, SubEntity, SalaryTransactionSupplement, EmployeeTaxCard,
    WageType, EmployeeCategory, BusinessRelation, SalaryBalance, UniEntity, Operator, CompanySalary
} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {IUniSaveAction} from '../../../../framework/save/save';
import {
    IToolbarConfig,
    IToolbarSearchConfig,
    IToolbarValidation,
    UniToolbar
} from '../../common/toolbar/toolbar';

import {IUniTagsConfig, ITag} from '../../common/toolbar/tags';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniView, ISaveObject} from '../../../../framework/core/uniView';
import {TaxCardModal} from './modals/taxCardModal';
import {
    UniModalService,
    ConfirmActions
} from '../../../../framework/uni-modal';
import {
    EmployeeService, EmploymentService, EmployeeLeaveService, DepartmentService, ProjectService,
    SalaryTransactionService, UniCacheService, SubEntityService, EmployeeTaxCardService, ErrorService,
    WageTypeService, FinancialYearService, BankAccountService, EmployeeCategoryService,
    ModulusService, SalarybalanceService, SalaryBalanceLineService, PayrollrunService, EmployeeOnCategoryService, CompanySalaryService,
    PageStateService
} from '../../../services/services';
import {EmployeeDetailsService} from './services/employeeDetailsService';
import {Subscription} from 'rxjs';
import * as _ from 'lodash';
import {tap, finalize, map, filter, switchMap} from 'rxjs/operators';
import { SalaryBalanceViewService } from '../shared/services/salaryBalanceViewService';
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
const UPDATE_RECURRING = '_updateRecurringTranses';

interface IEmployeeSaveConfig {
    done: (message) => void;
    ignoreRefresh?: boolean;
}

@Component({
    selector: 'uni-employee-details',
    templateUrl: './employeeDetails.html'
})
export class EmployeeDetails extends UniView implements OnDestroy {

    public busy: boolean;
    private url: string = '/salary/employees/';
    public childRoutes: any[];
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
    public saveActions: IUniSaveAction[];

    public toolbarConfig: IToolbarConfig;
    public toolbarSearchConfig: IToolbarSearchConfig;
    public toolbarValidation: IToolbarValidation[];

    private employeeTaxCard: EmployeeTaxCard;
    private wageTypes: WageType[] = [];
    private activeYear$: ReplaySubject<number> = new ReplaySubject(1);
    private categories: EmployeeCategory[];
    private savedNewEmployee: boolean;
    private taxOptions: any;
    private subscriptions: Subscription[] = [];
    private postSaveActions: ((config: IEmployeeSaveConfig) => Observable<any>)[] = [];
    public categoryFilter: ITag[] = [];
    public contextMenuItems: IContextMenuItem[] = [
        {
            label: 'Slett ansatt',
            action: () => {
                this.modalService.confirm({
                    header: 'Slette ansatt',
                    message: `Er du sikker på at du ønsker å slette ansatt ${this.employee.EmployeeNumber}`,
                    buttonLabels: {
                        accept: 'Ja',
                        reject: 'Nei'
                    }
                })
                .onClose.subscribe((res: ConfirmActions) => {
                    if (res === ConfirmActions.ACCEPT) {
                            this.busy = true;
                                this.employeeService.deleteEmployee(this.employee.ID)
                                .finally(() => {this.busy = false; })
                                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                                .subscribe((result) => {
                                    this.router.navigateByUrl('/salary/employees');
                                });
                        }
                        this.busy = false;
                    }
                );
            },
            disabled: (rowModel) => {
                if (this.employee && this.employee.ID > 0) { return false; }
                return true;
            }
        }];
    public tagConfig: IUniTagsConfig = {
        helpText: 'Kategorier på ansatt',
        truncate: 20,
        autoCompleteConfig: {
            template: (obj: EmployeeCategory) => obj ? `${obj.ID} - ${obj.Name}` : '',
            valueProperty: 'Name',
            saveCallback: (cat: EmployeeCategory) => this.employeeService.saveEmployeeTag(this.employeeID, cat),
            deleteCallback: (tag) => this.employeeOnCategoryService.deleteEmployeeTag(this.employeeID, tag),
            search: (query, ignoreFilter) => this.employeeCategoryService.searchCategories(query, ignoreFilter)
        },
        template: tag => `${tag.linkID} - ${tag.title}`
    };

    @ViewChild(UniToolbar, { static: true }) public toolbar: UniToolbar;

    constructor(
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private employeeLeaveService: EmployeeLeaveService,
        private employmentService: EmploymentService,
        private salaryTransService: SalaryTransactionService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        cacheService: UniCacheService,
        private errorService: ErrorService,
        private http: UniHttp,
        private employeeTaxCardService: EmployeeTaxCardService,
        private wageTypeService: WageTypeService,
        private financialYearService: FinancialYearService,
        private bankaccountService: BankAccountService,
        private employeeCategoryService: EmployeeCategoryService,
        private modulusService: ModulusService,
        private modalService: UniModalService,
        private employeeDetailsService: EmployeeDetailsService,
        private salarybalanceService: SalarybalanceService,
        private salaryBalanceViewService: SalaryBalanceViewService,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private payrollRunService: PayrollrunService,
        private employeeOnCategoryService: EmployeeOnCategoryService,
        private pageStateService: PageStateService
    ) {
        super(router.url, cacheService);

        this.activeYear$.next(this.financialYearService.getActiveYear());

        this.route
            .params
            .pipe(
                map(params => +params['id']),
                tap(id => this.refreshPaths(id)),
            )
            .subscribe((id) => {
            this.employeeID = id;
            this.tagConfig.readOnly = !this.employeeID;

            // Update cache key and clear data variables when employee ID is changed
            super.updateCacheKey(this.router.url);

            super.getStateSubject(SAVE_TRIGGER_KEY)
                .subscribe((type: Type<UniEntity>) => this.triggerSave(type));
            super.getStateSubject(NEW_TRIGGER_KEY)
                .subscribe((type: Type<UniEntity>) => this.createNewChildEntity(type));

            if (!this.employeeID) {
                this.cacheService.clearPageCache(this.cacheKey);
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
                .do(emp => this.fillInnSubEntityOnEmp(emp))
                .subscribe((employee: Employee) => {
                    this.employee = employee;
                    this.posterEmployee.employee = employee;
                    this.posterEmployee = _.cloneDeep(this.posterEmployee);

                    const info = employee && employee.BusinessRelationInfo;

                    let toolbarTitle = this.employee.ID ? this.employee.EmployeeNumber + ' - ' : '';
                    if (info && info.Name) {
                        toolbarTitle += info.Name;
                    }

                    this.toolbarConfig = {
                        title: toolbarTitle || 'Ny ansatt',
                        navigation: {
                            prev: this.previousEmployee.bind(this),
                            next: this.nextEmployee.bind(this),
                            add: this.newEmployee.bind(this)
                        }
                    };

                    this.toolbarSearchConfig = this.employeeDetailsService.setupToolbarSearchConfig(employee);
                    this.setToolbarValidation(this.employee, this.employeeTaxCard);

                    this.saveActions = [{
                        label: 'Lagre',
                        action: this.saveAll.bind(this),
                        main: true,
                        disabled: true
                    }];
                    this.checkDirty();
                }, err => this.errorService.handle(err));

            super.getStateSubject(EMPLOYMENTS_KEY)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe((employments: Employment[]) => {
                    this.employments = employments;
                    this.posterEmployee.employments = employments;
                    this.posterEmployee = _.cloneDeep(this.posterEmployee);
                    this.checkDirty();
                });

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
                    this.setToolbarValidation(this.employee, this.employeeTaxCard);
                    // this.updateTaxAlerts(employeeTaxCard);
                    this.checkDirty();
                });

            super.getStateSubject('taxCardModalCallback')
                .subscribe((options) => this.taxOptions = options);


            // If employee ID was changed by next/prev button clicks employee has been
            // pre-loaded. No need to clear and refresh in these cases
            if (this.employee && this.employee.ID === id) {
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
                                        data: this.employee,
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
                    if (childRoute.startsWith('employments')) {
                        if (!this.employments) {
                            this.getEmployments();
                            this.cacheProjects();
                            this.cacheDepartments();
                        }
                    }

                    if (childRoute === 'recurring-post') {
                        if (!this.recurringPosts) {
                            this.getEmployments(false);
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
                            this.getEmployments(false);
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

    private refreshPaths(employeeID: number) {
        this.employeeDetailsService
            .getCompanySalary()
            .subscribe(companySalary => this.childRoutes = this.getPaths(employeeID, companySalary));
    }

    private getPaths(employeeID: number, companySalary: CompanySalary): any[] {
        const disabled = employeeID === 0;
        const paths = [
            {name: 'Detaljer', path: 'personal-details'},
            {name: 'Skatt', path: 'employee-tax', disabled: disabled},
            {name: 'Arbeidsforhold', path: 'employments', disabled: disabled},
            {name: 'Faste poster', path: 'recurring-post', disabled: disabled},
            {name: 'Forskudd/trekk', path: 'employee-salarybalances', disabled: disabled},
            {name: 'Permisjon', path: 'employee-leave', disabled: disabled},
            {name: 'Historiske poster', path: 'employee-trans-ticker', disabled: disabled}
        ];
        if (companySalary && companySalary.OtpExportActive) {
            paths.push({name: 'OTP', path: 'employee-otp'});
        }
        return paths;
    }

    private fillInnSubEntityOnEmp(employee: Employee): void {
        if (employee.SubEntityID) {
            return;
        }
        this.getState(SubEntity)
            .take(1)
            .do(subEntities => {
                if (!subEntities || subEntities.length > 1) {
                    return;
                }
                employee.SubEntityID = subEntities[0].ID;
                this.updateStateWithType(Employee, employee, super.isDirty(EMPLOYEE_KEY));
            })
            .subscribe();
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
        this.employmentService.clearCache();
        this.employeeDetailsService.cleanUp();
    }

    public canDeactivate(): Observable<boolean> {
        return Observable
            .of(!super.isDirty() || this.savedNewEmployee)
            .switchMap(isSaved => isSaved
                ? Observable.of(ConfirmActions.REJECT)
                : this.modalService.openUnsavedChangesModal().onClose)
            .switchMap(action => Observable.forkJoin(this.createSaveObjects(), Observable.of(action)))
            .map((result: [ISaveObject[], ConfirmActions]) => {
                const [saveObj, action] = result;
                if (action !== ConfirmActions.CANCEL) {
                    this.cacheService.clearPageCache(this.cacheKey);
                }

                return this.handleSavingOnNavigation(action, saveObj);
            })
            .map(action => action !== ConfirmActions.CANCEL);
    }

    private handleSavingOnNavigation(action: ConfirmActions, saveObj: ISaveObject[]): ConfirmActions {
        if (action !== ConfirmActions.ACCEPT || !saveObj.some(x => x.dirty)) {
            return action;
        }
        this.saveAllObs({done: (m) => {}, ignoreRefresh: true}, saveObj)
            .subscribe();

        return action;
    }


    private setToolbarValidation(employee: Employee, taxCard: EmployeeTaxCard) {
        const validationMessages: IToolbarValidation[] = [];

        if (employee) {
            validationMessages.push({
                label: 'Kontonummer',
                type: employee.BusinessRelationInfo.DefaultBankAccountID
                    ? 'good' : 'bad',
                link: 'personal-details'
            });

            validationMessages.push({
                label: 'Fødselsnummer',
                type: this.modulusService.validSSN(employee.SocialSecurityNumber)
                    ? 'good' : 'bad',
                link: 'personal-details'
            });
        }

        if (taxCard) {
            const currentYear = new Date().getFullYear();
            validationMessages.push({
                label: 'Skattekort',
                type: this.employeeTaxCardService.hasTaxCard(taxCard, currentYear)
                    ? 'good' : 'bad',
                link: 'employee-tax'
            });
        }

        this.toolbarValidation = validationMessages;
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
                    this.router.navigateByUrl(this.url + emp.ID + '/personal-details');
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
                        .GetNewEntity(this.employeeTaxCardService.expandOptionsNewTaxcardEntity, EMPLOYEE_TAX_KEY)
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
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((employments) => {
                super.updateState(EMPLOYMENTS_KEY, employments, false);
            });
    }

    private getEmploymentsObservable(updateEmployments: boolean = false): Observable<Employment[]> {
        return updateEmployments || !this.employments
            ? this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID, ['Dimensions'])
                .map(employments => {
                    employments
                        .filter(employment => !employment.DimensionsID)
                        .map(x => {
                            x.Dimensions = new Dimensions();
                        });
                    return employments;
                })
            : Observable.of(this.employments);
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
        const postFilter = `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`;
        Observable.forkJoin(
            this.salaryTransService.GetAll('filter=' + postFilter, ['Supplements.WageTypeSupplement', 'Dimensions']),
            this.getAndCacheProjectsObservable(),
            this.getAndCacheDepartmentsObservable(),
            this.getWageTypesObservable(),
            this.getEmploymentsObservable(false))
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
            : this.wageTypeService.getOrderByWageTypeNumber('', ['SupplementaryInformations']);
    }

    private cacheProjects() {
        this.getAndCacheProjectsObservable()
            .subscribe();
    }

    private getAndCacheProjectsObservable() {
        return this.projects
            ? of(this.projects)
            : this.projectService
                .GetAll('')
                .pipe(
                    tap(projects => {
                        this.employmentService.setProjects(projects);
                        super.updateState('projects', projects, false);
                    }),
                );
    }

    private cacheDepartments() {
        this.getAndCacheDepartmentsObservable()
            .subscribe();
    }

    private getAndCacheDepartmentsObservable() {
        return this.departments
            ? of(this.departments)
            : this.departmentService
                .GetAll('')
                .pipe(
                    tap(departments => {
                        this.employmentService.setDepartments(departments);
                        super.updateState('departments', departments, false);
                    })
                );
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
        this.getSubEntitiesObservable()
            .subscribe(
                (response: SubEntity[]) => super.updateState(SUB_ENTITIES_KEY, response, false),
                err => this.errorService.handle(err)
            );
    }

    private getSubEntitiesObservable(): Observable<SubEntity[]> {
        return this.subEntities
            ? Observable.of(this.subEntities)
            : this.employmentService.getAllAndCacheSubEntities(['BusinessRelationInfo']);
    }

    private getFinancialYearObs() {
        return this.activeYear$.asObservable().take(1);
    }

    public onChildRouteChange() {
        // Update the tab to match childroute
        setTimeout(() => {
            this.tabService.addTab({
                name: this.employee.EmployeeNumber ?  'Ansattnr. ' + this.employee.EmployeeNumber : 'Ny ansatt',
                url: this.pageStateService.getUrl(),
                moduleID: UniModules.Employees,
                active: true
            });
        });
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
            this.createSaveObjects()
                .switchMap(saveObj => this.saveAllObs({done: done}, saveObj))
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
            case SubEntity:
                return super.getStateSubject(SUB_ENTITIES_KEY).take(1);
        }
    }

    private updateStateWithType(type: Type<UniEntity>, model: any, isDirty: boolean = false) {
        switch (type) {
            case SalaryBalance:
                super.updateState(SALARYBALANCES_KEY, model, isDirty);
                break;
            case Employee:
                super.updateState(EMPLOYEE_KEY, model, isDirty);
                break;
        }
    }

    private saveAll(done: (message: string) => void) {
        super.updateState(SAVING_KEY, true, false);
        this.createSaveObjects()
            .switchMap(saveObj => this.saveAllObs({done: done}, saveObj))
            .finally(() => super.updateState(SAVING_KEY, false, false))
            .subscribe();
    }

    private createSaveObjects(): Observable<ISaveObject[]> {
        return Observable.forkJoin([
            this.getSaveObject(EMPLOYEE_KEY),
            this.getSaveObject(EMPLOYEE_LEAVE_KEY),
            this.getSaveObject(EMPLOYEE_TAX_KEY),
            this.getSaveObject(EMPLOYMENTS_KEY),
            this.getSaveObject(RECURRING_POSTS_KEY),
            this.getSaveObject(SALARYBALANCES_KEY)
        ]);
    }

    private saveAllObs(config: IEmployeeSaveConfig, saveObjects: ISaveObject[]): Observable<any[]> {
        return this.saveEmployee(saveObjects)
            .catch((error, obs) => {
                config.done('Feil ved lagring');
                return this.errorService.handleRxCatch(error, obs);
            })
            .switchMap(
                (employee) => {

                    if (!this.employeeID && !config.ignoreRefresh) {
                        super.updateState(EMPLOYEE_KEY, this.employee, false);

                        config.done('Lagring fullført');

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
                            config.done('Feil ved lagring');
                            return this.errorService.handleRxCatch(err, obs);
                        })
                        .switchMap((emp) => {
                            if (!config.ignoreRefresh) {
                                super.updateState(EMPLOYEE_KEY, emp, false);
                            }

                            this.saveStatus = {
                                numberOfRequests: 0,
                                completeCount: 0,
                                hasErrors: false,
                            };

                            const obsList: Observable<any>[] = saveObjects
                                .map(obj => this.saveSubField(config, obj, _.cloneDeep(emp)))
                                .filter(obs => !!obs);

                            if (!this.saveStatus.numberOfRequests) {
                                this.saveActions[0].disabled = true;
                                config.done('Lagring fullført');
                            }

                            return Observable.forkJoin(obsList);
                        });
                }
            )
            .pipe(
                tap(() => this.handlePostSaves(config))
            );
    }

    private saveSubField(config: IEmployeeSaveConfig, saveObj: ISaveObject, parentState: Employee) {
        if (!saveObj || !saveObj.dirty || !saveObj.state) {
            return null;
        }
        if (saveObj.dirty) {
            this.saveStatus.numberOfRequests++;
        }
        switch (saveObj.key) {
            case EMPLOYMENTS_KEY:
                return this.saveEmploymentsObs(config, saveObj.state, parentState);
            case RECURRING_POSTS_KEY:
                return this.saveRecurringPostsObs(config, saveObj.state, parentState);
            case SALARYBALANCES_KEY:
                return this.saveSalarybalancesObs(config, saveObj.state, parentState);
            case EMPLOYEE_LEAVE_KEY:
                return this.saveEmployeeLeaveObs(config, saveObj.state);
            case EMPLOYEE_TAX_KEY:
                return this.saveTax(config, saveObj.state, parentState);
        }
        if (saveObj.dirty) {
            this.saveStatus.numberOfRequests--;
        }


        return null;
    }

    private schedualPostSave(action: (config: IEmployeeSaveConfig) => Observable<any>) {
        this.postSaveActions.push(action);
    }

    private handlePostSaves(config: IEmployeeSaveConfig) {
        const actions = [...this.postSaveActions];
        this.postSaveActions = [];
        forkJoin(actions.map(action => action(config)))
            .subscribe();
    }

    private saveEmployee(saveObj: ISaveObject[]): Observable<Employee> {
        this.employeeService.invalidateCache();
        const empSaveObj = saveObj.find(obj => obj.key === EMPLOYEE_KEY);
        // If employee is untouched and exists in backend we dont have to save it again
        if (!empSaveObj || !empSaveObj.state || (!empSaveObj.dirty && this.employee.ID > 0)) {
            return Observable.of(this.employee);
        }

        return Observable.of(empSaveObj.state)
            .map((emp: Employee) => {
                if (emp.EmployeeNumber === null) {
                    emp.EmployeeNumber = 0;
                }
                const brInfo = emp.BusinessRelationInfo;
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
                emp.BusinessRelationInfo = brInfo;
                emp['_EmployeeSearchResult'] = undefined;

                if (!emp.IncludeOtpUntilMonth) {
                    emp.IncludeOtpUntilMonth = 0;
                }
                if (!emp.IncludeOtpUntilMonth) {
                    emp.IncludeOtpUntilYear = 0;
                }
                return emp;
            })
            .switchMap(emp => !!emp.ID
                ? this.employeeService.Put(emp.ID, emp)
                : this.employeeService.Post(emp));
    }

    private saveTax(config: IEmployeeSaveConfig, tax: EmployeeTaxCard, employee: Employee) {
        let year = 0;
        return this.getFinancialYearObs()
            .do(fYear => year = fYear)
            .map(() => tax)
            .take(1)
            .switchMap((employeeTaxCard: EmployeeTaxCard) => {
                if (!this.employeeTaxCardService.isEmployeeTaxcard2018Model(employeeTaxCard) || employeeTaxCard.Year < 2018) {
                    return this.employeeTaxCardService.updateModelTo2018(employeeTaxCard, employee.ID);
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
                if (employeeTaxCard.ufoereYtelserAndre && !employeeTaxCard.ufoereYtelserAndreID) {
                    employeeTaxCard.ufoereYtelserAndre['_createguid'] = this.employeeTaxCardService.getNewGuid();
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
                this.checkForSaveDone(config.done);
            })
            .do(updatedTaxCard => {
                if (updatedTaxCard && !config.ignoreRefresh) {
                    super.updateState(EMPLOYEE_TAX_KEY, updatedTaxCard, false);
                }
            });
    }

    private saveEmploymentsObs(config: IEmployeeSaveConfig, emps: Employment[], employee: Employee): Observable<Employment[]> {
        this.employmentService.invalidateCache();
        return Observable
            .of(emps)
            .pipe(
                switchMap(empls => this.schedualEmploymentPostSave(empls))
            )
            .switchMap((employments: Employment[]) => {
                const changes = [];
                let hasStandard = false;

                employments
                    .forEach((employment) => {
                        if (employment.Standard) {
                            hasStandard = true;
                        }
                        if (!employment['_isDirty']) {
                            return;
                        }

                        if (employment.Dimensions && !employment.DimensionsID) {
                            if (Object.keys(employment.Dimensions)
                                .filter(x => x.indexOf('ID') > -1)
                                .some(key => employment.Dimensions[key])) {
                                    employment.Dimensions['_createguid'] = this.employmentService.getNewGuid();
                            } else {
                                employment.Dimensions = null;
                            }
                        }
                        employment.EmployeeID = employee.ID;
                        employment.EmployeeNumber = employee.EmployeeNumber;
                        employment.MonthRate = employment.MonthRate || 0;
                        employment.HourRate = employment.HourRate || 0;
                        employment.UserDefinedRate = employment.UserDefinedRate || 0;
                        employment.WorkPercent = employment.WorkPercent || 0;
                        employment.HoursPerWeek = employment.HoursPerWeek || 0;

                        changes.push(employment);
                    });

                if (!hasStandard) {
                    changes[0].Standard = true;
                }

                // Save employments by using complex put on employee
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
                        this.checkForSaveDone(config.done);
                    })
                    .do(
                        () => {
                            if (!config.ignoreRefresh) {
                                this.getEmployments();
                            }
                        })
                    .map((emp: Employee) => {
                        return emp.Employments;
                    });
            })
            .pipe(
                tap(employments => {

                    if (!employments.some(emp => !!emp.StartDate)) {
                        return;
                    }
                    if (!employee.SocialSecurityNumber) {
                        this.toastService
                            .addToast('Mangler fødselsnummer', ToastType.warn, ToastTime.long, 'Fødselsnummer mangler på ansatt');
                    }
                    const employmentsMissingType = employments
                        .filter(emp => !emp.TypeOfEmployment);

                    if (employmentsMissingType.length) {
                        let message = `Arbeidsforhold `;
                        let last: Employment = null;
                        if (employmentsMissingType.length > 1) {
                            last = employmentsMissingType.pop();
                        }
                        message += `${employmentsMissingType.map(emp => `"${emp.ID} - ${emp.JobName}"`).join(`, `)}`
                            + `${last ? ` og "${last.ID} - ${last.JobName}"` : ''}`;
                        this.toastService
                            .addToast(
                                'Mangler informasjon om type arbeidsforhold',
                                ToastType.warn,
                                ToastTime.long,
                                `${message} mangler informasjon om type arbeidsforhold. `
                                + `Dette medfører at a-melding vil bli avvist. `
                                + `Vennligst fyll ut informasjon i feltet`);
                    }
                })
            );
    }

    private schedualEmploymentPostSave(employments: Employment[]) {
        const updateEmpIds = employments.filter(emp => emp[UPDATE_RECURRING]).map(emp => emp.ID);
        if (!updateEmpIds.length) {
            return of(employments);
        }

        return this.modalService
            .confirm({
                header: 'Oppdatere dimensjoner på faste poster og trekk',
                message: 'Vil du oppdatere dimensjoner på faste poster og trekk med dimensjoner fra arbeidsforhold?',
                buttonLabels: {
                    accept: 'Ja',
                    reject: 'Nei',
                }
            })
            .onClose
            .pipe(
                tap((userInput) => {
                    if (userInput !== ConfirmActions.ACCEPT) {
                        return;
                    }
                    this.schedualPostSave(config => {
                        return this.updateTransesAndSalaryBalancesFromEmployments(config, updateEmpIds);
                    });
                }),
                map(() => employments),
            );
    }

    private updateTransesAndSalaryBalancesFromEmployments(config: IEmployeeSaveConfig, updateEmpIds: number[]) {
        return this.salarybalanceService
                    .updateFromEmployments(updateEmpIds)
                    .pipe(
                        switchMap(() => this.salaryTransService.updateFromEmployments(updateEmpIds)),
                        filter((transes) => !config.ignoreRefresh && !!transes.length),
                        tap(() => setTimeout(() => this.getRecurringPosts())),
                    );
    }

    private saveSalarybalancesObs(config: IEmployeeSaveConfig, salBals: SalaryBalance[], employee: Employee): Observable<SalaryBalance[]> {
        this.salaryBalanceLineService.invalidateCache();
        return Observable
            .of(salBals)
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
                        salarybalance.EmployeeID = employee.ID;

                        const newObs: Observable<SalaryBalance> = this.handleSalaryBalanceUpdate(salarybalance)
                            .catch((err, obs) => {
                                hasErrors = true;
                                salarybalances[index].Deleted = false;
                                const toastHeader =
                                    `Feil ved lagring av trekk linje ${salarybalance['_originalIndex'] + 1}`;
                                const toastBody = (err && err.error && err.error.Messages) ? err.error.Messages[0].Message : '';
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
                                    if (!config.ignoreRefresh) {
                                        super.updateState(SALARYBALANCES_KEY,
                                            salarybalances.filter(x => !x.Deleted),
                                            salarybalances.some(salbal => salbal['_isDirty']));
                                    }

                                    this.checkForSaveDone(config.done);
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

    private saveRecurringPostsObs(
        config: IEmployeeSaveConfig,
        transes: SalaryTransaction[],
        employee: Employee): Observable<SalaryTransaction[]> {
        return Observable
            .of(transes)
            .switchMap((recurringPosts: SalaryTransaction[]) => {
                const obsList: Observable<SalaryTransaction>[] = [];
                let hasErrors = false;

                recurringPosts.forEach((post, index) => {
                    if (!post['_isEmpty'] && post['_isDirty'] || post.Deleted) {

                        post.IsRecurringPost = true;
                        post.EmployeeID = employee.ID;
                        post.EmployeeNumber = employee.EmployeeNumber;
                        post.EmploymentID = post.EmploymentID || 0;

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
                                    this.getAndCacheProjectsObservable(),
                                    this.getAndCacheDepartmentsObservable(),
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
                            .catch((err, obs) => {
                                hasErrors = true;
                                recurringPosts[index].Deleted = false;
                                const toastHeader =
                                    `Feil ved lagring av faste poster linje ${post['_originalIndex'] + 1}`;
                                const toastBody = (err && err.error && err.error.Messages) ? err.error.Messages[0].Message : '';
                                this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                                return this.errorService.handleRxCatch(err, obs);
                            })
                            .map((res: SalaryTransaction) => {
                                recurringPosts[index] = res;
                                return res;
                            });

                        obsList.push(newObs);
                    }
                });
                if (!obsList.length) {
                    return of([]);
                }
                return from(this.runTransSave(obsList))
                    .pipe(finalize(() => {
                            this.saveStatus.completeCount++;
                            if (hasErrors) {
                                this.saveStatus.hasErrors = true;
                            }
                            if (!config.ignoreRefresh) {
                                super.updateState(RECURRING_POSTS_KEY,
                                    recurringPosts.filter(x => !x.Deleted),
                                    recurringPosts.some(trans => trans['_isDirty']));
                            }

                            this.checkForSaveDone(config.done);
                        }),
                    );
            });
    }

    private async runTransSave(obsList: Observable<SalaryTransaction>[]) {
        const ret: SalaryTransaction[] = [];
        for (let i: number = 0; i < obsList.length; i++) {
            const result = await obsList[i].toPromise();
            ret.push(result);
        }
        return ret;
    }

    private reportRecurringPostError(post: SalaryTransaction, err: any, hasErrors: boolean) {
        hasErrors = true;
        post.Deleted = false;
        const toastHeader =
            `Feil ved lagring av faste poster linje ${post['_originalIndex'] + 1}`;
        const toastBody = (err.error.Messages) ? err.error.Messages[0].Message : '';
        this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
        this.errorService.handle(err);
        return Observable.empty();
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
                .map(response => response.body);
        }

        return Observable.of(null);
    }

    private saveEmployeeLeaveObs(config: IEmployeeSaveConfig, leaves: EmployeeLeave[]): Observable<EmployeeLeave[]> {
        return Observable
            .of(leaves)
            .switchMap((employeeLeave: EmployeeLeave[]) => {
                const obsList: Observable<EmployeeLeave>[] = [];
                let changeCount = 0;
                let saveCount = 0;
                let hasErrors = false;

                employeeLeave
                    .forEach((leave, index) => {
                        if (!leave['_isEmpty'] && (leave['_isDirty'] || leave.Deleted)) {
                            changeCount++;

                            if (leave.Employment && leave.Employment.Dimensions && !leave.Employment.DimensionsID) {
                                if (Object.keys(leave.Employment.Dimensions)
                                    .filter(x => x.indexOf('ID') > -1)
                                    .some(key => leave.Employment.Dimensions[key])) {
                                        leave.Employment.Dimensions['_createguid'] = this.employmentService.getNewGuid();
                                } else {
                                    leave.Employment.Dimensions = null;
                                }
                            }

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
                                    } else if (!config.ignoreRefresh) {
                                        super.updateState(
                                            EMPLOYEE_LEAVE_KEY,
                                            employeeLeave.filter(l => !l.Deleted),
                                            false);
                                    }
                                    this.checkForSaveDone(config.done); // check if all save functions are finished
                                }
                            })
                                .catch((err, obs) => {
                                    leave.Deleted = false;
                                    hasErrors = true;
                                    saveCount++;
                                    const rules = this.errorService.extractEntityValidationRules(err);
                                    if (rules.find(x => x.PropertyName === 'EmploymentID' && x.Operator === Operator.Required)) {
                                        employeeLeave[index]['_isDirty'] = false;
                                        super.updateState(EMPLOYEE_LEAVE_KEY, employeeLeave, false);
                                    }
                                    return this.errorService.handleRxCatch(err, obs);
                                })
                                .do((res: EmployeeLeave) => {
                                    employeeLeave[index] = res;
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
