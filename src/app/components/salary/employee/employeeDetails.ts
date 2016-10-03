import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {EmployeeCategoryButtons} from './employeeCategoryButtons';
import {Employee, Employment, EmployeeLeave, SalaryTransaction} from '../../../unientities';
import {EmployeeDS} from '../../../data/employee';
import {STYRKCodesDS} from '../../../data/styrkCodes';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {EmployeeService, EmploymentService, EmployeeLeaveService, SalaryTransactionService, UniCacheService} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';


import {UniView} from '../../../../framework/core/uniView';
declare var _; // lodash

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html',
    providers: [
        EmployeeDS,
        STYRKCodesDS,
        EmployeeService,
        EmployeeLeaveService,
        EmploymentService,
        SalaryTransactionService,
    ],
    directives: [
        ROUTER_DIRECTIVES,
        WidgetPoster,
        UniTabs,
        EmployeeCategoryButtons,
        ContextMenu,
        UniSave
    ]
})
export class EmployeeDetails extends UniView {
    public busy: boolean;
    private url: string = '/salary/employees/';
    private childRoutes: any[];
    private saveStatus: {numberOfRequests: number, completeCount: number, hasErrors: boolean};

    private employeeID: number;
    private employee: Employee;
    private employments: Employment[];
    private recurringPosts: SalaryTransaction[];
    private employeeLeave: EmployeeLeave[];

    constructor(private route: ActivatedRoute,
                private employeeService: EmployeeService,
                private employeeLeaveService: EmployeeLeaveService,
                private employmentService: EmploymentService,
                private salaryTransService: SalaryTransactionService,
                private toastService: ToastService,
                private router: Router,
                private tabService: TabService,
                cacheService: UniCacheService) {

        super(router.url, cacheService);

        this.childRoutes = [
            { name: 'Detaljer', path: 'personal-details' },
            { name: 'Arbeidsforhold', path: 'employments' },
            { name: 'Faste poster', path: 'recurring-post' },
            { name: 'Permisjon', path: 'employee-leave' }
        ];

        this.saveActions = [{
            label: 'Lagre',
            action: this.saveAll.bind(this),
            main: true,
            disabled: true
        }];

        this.route.params.subscribe((params) => {
            this.employeeID = +params['id'];

            // Update cache key and clear data variables when employee ID is changed
            super.updateCacheKey(this.router.url);
            this.employments = undefined;
            this.employeeLeave = undefined;
            this.recurringPosts = undefined;

            // (Re)subscribe to state var updates
            super.getStateSubject('employee').subscribe((employee) => {
                this.employee = employee;
                this.checkDirty();
            });

        super.getStateSubject('employments').subscribe((employments) => {
            this.employments = employments;
            this.checkDirty();
        });

        super.getStateSubject('recurringPosts').subscribe((recurringPosts) => {
            this.recurringPosts = recurringPosts;
            this.checkDirty();
        });

        super.getStateSubject('employeeLeave').subscribe((employeeLeave) => {
            this.employeeLeave = employeeLeave;
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
            if (this.employeeID) {
                this.tabService.addTab({
                    name: 'Ansattnr. ' + this.employeeID,
                    url: this.url + this.employeeID,
                    moduleID: 12,
                    active: true
                });
            } else {
                this.tabService.addTab({
                    name: 'Ny ansatt',
                    url: this.url + this.employeeID,
                    moduleID: 12,
                    active: true
                });
            }
        });

        // Subscribe to route changes and load necessary data
        this.router.events.subscribe((event: any) => {
            if (event.constructor.name === 'NavigationEnd') {
                let childRoute = event.url.split('/').pop();

                if (!this.employee) {
                    this.getEmployee();
                }

                if (childRoute !== 'personal-details' && !this.employments) {
                    this.getEmployments();
                }

                if (childRoute === 'recurring-post' && !this.recurringPosts) {
                    this.getRecurringPosts();
                }

                if (childRoute === 'employee-leave' && !this.employeeLeave) {
                    super.getStateSubject('employments').subscribe(() => {
                        this.getEmployeeLeave();
                    });
                }
            }
        });
    }

    public nextEmployee() {
        if (!super.canDeactivate()) {
            return;
        }

        this.employeeService.getNext(this.employee.ID).subscribe((next: Employee) => {
            if (next) {
                this.employee = next;
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
            }
        });
    }

    public previousEmployee() {
        if (!super.canDeactivate()) {
            return;
        }

        this.employeeService.getPrevious(this.employee.ID).subscribe((prev: Employee) => {
            if (prev) {
                this.employee = prev;
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + prev.ID + '/' + childRoute);
            }
        });
    }

    private getEmployee() {
        this.employeeService.get(this.employeeID).subscribe((employee: Employee) => {
            this.employee = employee;
            super.updateState('employee', employee, false);
        });
    }

    private getEmployments() {
        this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID).subscribe((employments) => {
            super.updateState('employments', employments, false);
        });
    }

    private getRecurringPosts() {
        let filter = `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`;
        this.salaryTransService.GetAll('filter=' + filter).subscribe((response) => {
            super.updateState('recurringPosts', response, false);
        });
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
        });
    }
}
