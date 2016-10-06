import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Router, ActivatedRoute} from '@angular/router';
import {Employee, Employment, EmployeeLeave, SalaryTransaction} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {EmployeeService, EmploymentService, EmployeeLeaveService, SalaryTransactionService, UniCacheService} from '../../../services/services';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';


import {UniView} from '../../../../framework/core/uniView';
declare var _; // lodash

@Component({
    selector: 'uni-employee-details',
    templateUrl: 'app/components/salary/employee/employeeDetails.html'
})
export class EmployeeDetails extends UniView {
    @ViewChild(UniSave)
    private saveComponent: UniSave;

    public busy: boolean;
    private url: string = '/salary/employees/';
    private childRoutes: any[];
    private saveStatus: {numberOfRequests: number, completeCount: number, hasErrors: boolean};

    private employeeID: number;
    private employee: Employee;
    private employments: Employment[];
    private recurringPosts: SalaryTransaction[];
    private employeeLeave: EmployeeLeave[];
    private saveActions: IUniSaveAction[];

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
                    moduleID: UniModules.Employees,
                    active: true
                });
            } else {
                this.tabService.addTab({
                    name: 'Ny ansatt',
                    url: this.url + this.employeeID,
                    moduleID: UniModules.Employees,
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

                if (childRoute === 'recurring-post') {
                    this.beforeChildEdit('faste poster');
                    if (!this.recurringPosts) {
                        this.getRecurringPosts();
                    }
                }

                if (childRoute === 'employee-leave') {
                    this.beforeChildEdit('permisjoner');
                    if (!this.employeeLeave) {
                        super.getStateSubject('employments').subscribe(() => {
                            this.getEmployeeLeave();
                        });
                    }
                }
            }
        });
    }

    private checkDirty() {
        if (super.isDirty()) {
            this.saveActions[0].disabled = false;
        }
    }

    private beforeChildEdit(childName: string) {
        let newAndUnsaved = (this.employments) ? this.employments.find(employment => !employment.ID) : undefined;
        if (newAndUnsaved && window.confirm(`Arbeidsforhold må lagres før ${childName} kan redigeres. Ønsker du å lagre nå?`)) {
            this.saveComponent.manualSaveStart();
            this.saveAll();
        }
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

    private checkForSaveDone() {
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                this.saveComponent.manualSaveComplete('Lagring feilet');
            } else {
                this.saveComponent.manualSaveComplete('Lagring fullført');
            }
        }
    }

    private saveAll(done?: (message: string) => void) {
        this.saveEmployee().subscribe(
            (employee) => {
                super.updateState('employee', employee, false);
                this.saveStatus = {
                    numberOfRequests: 0,
                    completeCount: 0,
                    hasErrors: false,
                };

                if (super.isDirty('employments')) {
                    this.saveEmployments();
                    this.saveStatus.numberOfRequests++;
                }

                if (super.isDirty('recurringPosts')) {
                    this.saveRecurringPosts();
                    this.saveStatus.numberOfRequests++;
                }

                if (super.isDirty('employeeLeave')) {
                    this.saveEmployeeLeave();
                    this.saveStatus.numberOfRequests++;
                }

                if (!this.saveStatus.numberOfRequests) {
                    done('Lagring fullført');
                }

            },
            (error) => {
                let toastHeader = 'Noe gikk galt ved lagring av persondetaljer';
                let toastBody = (error.json().Messages) ? error.json().Messages[0].Message : '';
                this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
            }
        );
    }

    private saveEmployee(): Observable<Employee> {
        let brInfo = this.employee.BusinessRelationInfo;

        // If employee is untouched and exists in backend we dont have to save it again
        if (!super.isDirty('employee') && this.employee.ID > 0) {
            return Observable.of(this.employee);
        }

        brInfo.Emails.forEach((email) => {
            if (email.ID === 0) {
                email['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        brInfo.Phones.forEach((phone) => {
            if (phone.ID === 0) {
                phone['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        brInfo.Addresses.forEach((address) => {
            if (address.ID === 0) {
                address['_createguid'] = this.employeeService.getNewGuid();
            }
        });

        return (this.employee.ID > 0)
            ? this.employeeService.Put(this.employee.ID, this.employee)
            : this.employeeService.Post(this.employee);
    }

    private saveEmployments() {
        super.getStateSubject('employments').take(1).subscribe((employments: Employment[]) => {
            let changes = [];
            let hasStandard = false;

            // Build changes array consisting of only changed employments
            // Append _createguid to new employments
            // Check for standard employment
            employments.forEach((employment) => {
                if (employment.Standard) {
                    hasStandard = true;
                }

                if (employment['_isDirty']) {
                    employment.EmployeeID = this.employee.ID;
                    employment.EmployeeNumber = this.employee.EmployeeNumber;

                    if (employment.ID === 0) {
                        employment['_createguid'] = this.employeeService.getNewGuid();
                    }

                    changes.push(employment);
                }
            });

            if (!hasStandard) {
                changes[0].Standard = true;
            }

            // Save employments by using complex put on employee
            let employee = _.cloneDeep(this.employee);
            employee.Employments = changes;

            this.employeeService.Put(employee.ID, employee)
                .finally(() => this.checkForSaveDone())
                .subscribe(
                    (res) => {
                        this.saveStatus.completeCount++;
                        this.getEmployments();
                    },
                    (err) => {
                        this.saveStatus.completeCount++;
                        this.saveStatus.hasErrors = true;

                        let toastHeader = 'Noe gikk galt ved lagring av arbeidsforhold';
                        let toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                        this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                    }
                );
        });
    }

    private saveRecurringPosts() {
        super.getStateSubject('recurringPosts').take(1).subscribe((recurringPosts: SalaryTransaction[]) => {
            let changeCount = 0;
            let saveCount = 0;
            let hasErrors = false;

            recurringPosts.forEach((post) => {
                if (post['_isDirty']) {
                    changeCount++;

                    post.IsRecurringPost = true;
                    post.EmployeeID = this.employee.ID;
                    post.EmployeeNumber = this.employee.EmployeeNumber;

                    let source = (post.ID > 0)
                        ? this.salaryTransService.Put(post.ID, post)
                        : this.salaryTransService.Post(post);

                    source.finally(() => {
                        if (saveCount === changeCount) {
                            this.saveStatus.completeCount++;
                            if (hasErrors) {
                                this.saveStatus.hasErrors = true;
                            } else {
                                super.updateState('recurringPosts', recurringPosts, false);
                            }
                            this.checkForSaveDone();
                        }
                    })
                    .subscribe(
                        (res: SalaryTransaction) => {
                            saveCount++;
                            post = res;
                        },
                        (err) => {
                            hasErrors = true;
                            saveCount++;
                            console.log(err);
                            let toastHeader = `Feil ved lagring av faste poster linje ${post['_originalIndex'] + 1}`;
                            let toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                            this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                        }
                    );
                }
            });
        });
    }

    private saveEmployeeLeave() {
        super.getStateSubject('employeeLeave').take(1).subscribe((employeeLeave: EmployeeLeave[]) => {
            let changeCount = 0;
            let saveCount = 0;
            let hasErrors = false;

            employeeLeave.forEach((leave) => {
                if (leave['_isDirty']) {
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
                            } else {
                                super.updateState('employeeLeave', employeeLeave, false);
                            }
                            this.checkForSaveDone(); // check if all save functions are finished
                        }
                    })
                    .subscribe(
                        (res: EmployeeLeave) => {
                            leave = res;
                            saveCount++;
                        },
                        (err) => {
                            hasErrors = true;
                            saveCount++;
                            let toastHeader = `Feil ved lagring av permisjoner linje ${leave['_originalIndex'] - 1}`;
                            let toastBody = (err.json().Messages) ? err.json().Messages[0].Message : '';
                            this.toastService.addToast(toastHeader, ToastType.bad, 0, toastBody);
                        }
                    );
                }
            });
        });
    }

}
