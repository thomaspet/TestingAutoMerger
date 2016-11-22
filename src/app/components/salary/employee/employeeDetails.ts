import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { Employee, Employment, EmployeeLeave, SalaryTransaction, SubEntity, SalaryTransactionSupplement } from '../../../unientities';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { EmployeeService, EmploymentService, EmployeeLeaveService, SalaryTransactionService, UniCacheService, SubEntityService } from '../../../services/services';
import { ToastService, ToastType } from '../../../../framework/uniToast/toastService';
import { UniSave, IUniSaveAction } from '../../../../framework/save/save';
import { IToolbarConfig } from '../../common/toolbar/toolbar';


import { UniView } from '../../../../framework/core/uniView';
import {ErrorService} from '../../../services/common/ErrorService';
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
    private saveStatus: { numberOfRequests: number, completeCount: number, hasErrors: boolean };

    private employeeID: number;
    private employee: Employee;
    private posterEmployee: any = {};
    private employments: Employment[];
    private recurringPosts: SalaryTransaction[];
    private employeeLeave: EmployeeLeave[];
    private subEntities: SubEntity[];
    private saveActions: IUniSaveAction[];
    private toolbarConfig: IToolbarConfig;
    private datachecks: any;

    constructor(
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private employeeLeaveService: EmployeeLeaveService,
        private employmentService: EmploymentService,
        private salaryTransService: SalaryTransactionService,
        private subEntityService: SubEntityService,
        private toastService: ToastService,
        private router: Router,
        private tabService: TabService,
        cacheService: UniCacheService,
        private errorService: ErrorService
    ) {

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
            this.subEntities = undefined;

            // (Re)subscribe to state var updates
            super.getStateSubject('employee').subscribe((employee) => {
                this.datachecks = this.boolChecks(employee);
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
                this.checkDirty();
            }, this.errorService.handle);

            super.getStateSubject('employments').subscribe((employments) => {
                this.employments = employments;
                this.posterEmployee.employments = employments;
                this.posterEmployee = _.cloneDeep(this.posterEmployee);
                this.checkDirty();
            }, this.errorService.handle);

            super.getStateSubject('recurringPosts').subscribe((recurringPosts) => {
                this.recurringPosts = recurringPosts;
                this.checkDirty();
            }, this.errorService.handle);

            super.getStateSubject('employeeLeave').subscribe((employeeLeave) => {
                this.employeeLeave = employeeLeave;
                this.checkDirty();
            }, this.errorService.handle);

            super.getStateSubject('subEntities').subscribe((subEntities: SubEntity[]) => {
                this.subEntities = subEntities;
            }, this.errorService.handle);


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
                    name: 'Ansattnr. ' + (this.employee ? this.employee.EmployeeNumber : this.employeeID),
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

                if (!this.employments) {
                    this.getEmployments();
                }

                if (childRoute === 'recurring-post') {
                    if (!this.recurringPosts) {
                        this.getRecurringPosts();
                    }
                }

                if (childRoute === 'employee-leave') {
                    if (!this.employeeLeave) {
                        super.getStateSubject('employments').subscribe(() => {
                            this.getEmployeeLeave();
                        });
                    }
                }

                if (childRoute !== 'employee-leave' && childRoute !== 'recurring-post') {
                    if (!this.subEntities) {
                        this.getSubEntities();
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

    // Dummy check to see is user has Tax Card, social security number and account number
    private boolChecks(employee: Employee) {
        return {
            hasTaxCard: employee.TaxPercentage || employee.TaxTable,
            hasSSN: employee.SocialSecurityNumber !== null && employee.SocialSecurityNumber !== '',
            hasAccountNumber: employee.BankAccounts[0] !== undefined && employee.BankAccounts[0] !== null && employee.BankAccounts[0].AccountNumber !== undefined && employee.BankAccounts[0].AccountNumber !== '' && employee.BankAccounts[0].AccountNumber !== null
        };
    }

    public nextEmployee() {
        if (!super.canDeactivate()) {
            return;
        }

        // TODO: this should use BizHttp.getNextID()
        this.employeeService.getNext(this.employee.ID).subscribe((next: Employee) => {
            if (next) {
                this.employee = next;
                let childRoute = this.router.url.split('/').pop();
                this.router.navigateByUrl(this.url + next.ID + '/' + childRoute);
            }
        }, this.errorService.handle);
    }

    // TODO: this should use BizHttp.getPreviousID()
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
        }, this.errorService.handle);
    }

    public newEmployee() {
        if (!super.canDeactivate()) {
            return;
        }
        this.employeeService.get(0).subscribe((emp: Employee) => {
            this.employee = emp;
            let childRoute = this.router.url.split('/').pop();
            this.router.navigateByUrl(this.url + emp.ID + '/' + childRoute);
        }, this.errorService.handle);
    }

    private getEmployee() {
        this.employeeService.get(this.employeeID).subscribe((employee: Employee) => {
            this.employee = employee;
            super.updateState('employee', employee, false);
        }, this.errorService.handle);
    }

    private getEmployments() {
        this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID).subscribe((employments) => {
            super.updateState('employments', employments, false);
        }, this.errorService.handle);
    }

    private getRecurringPosts() {
        let filter = `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`;
        this.salaryTransService.GetAll('filter=' + filter, ['Supplements.WageTypeSupplement']).subscribe((response) => {
            super.updateState('recurringPosts', response, false);
        }, this.errorService.handle);
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
        }, this.errorService.handle);
    }

    private getSubEntities() {
        this.subEntityService.GetAll(null, ['BusinessRelationInfo']).subscribe((response: SubEntity[]) => {
            super.updateState('subEntities', response.length > 1 ? response.filter(x => x.SuperiorOrganizationID > 0) : response, false);
        }, this.errorService.handle);
    }

    private checkForSaveDone() {
        if (this.saveStatus.completeCount === this.saveStatus.numberOfRequests) {
            if (this.saveStatus.hasErrors) {
                this.saveComponent.manualSaveComplete('Lagring feilet');
            } else {
                this.saveComponent.manualSaveComplete('Lagring fullført');
                this.saveActions[0].disabled = true;
            }
        }
    }

    private saveAll(done?: (message: string) => void) {
        this.saveEmployee().subscribe(
            (employee) => {

                if (!this.employeeID) {
                    super.updateState('employee', this.employee, false);
                    
                    if (done) {
                        done('Lagring fullført');
                    } else {
                        this.saveComponent.manualSaveComplete('Lagring fullført');
                    }

                    let childRoute = this.router.url.split('/').pop();
                    this.router.navigateByUrl(this.url + employee.ID + '/' + childRoute);
                    return;
                }

                // REVISIT: GETing the employee after saving is a bad "fix" but currenctly necessary
                // because response will not contain any new email/address/phone.
                // Anders is looking for a better way to solve this..
                this.employeeService.get(this.employeeID).subscribe((emp) => {
                    super.updateState('employee', emp, false);
                    // super.updateState('employee', employee, false);

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
                        this.saveActions[0].disabled = true;
                        if (done) {
                            done('Lagring fullført');
                        } else {
                            this.saveComponent.manualSaveComplete('Lagring fullført');
                        }
                    }
                });
            },
            (error) => {
                if (done) {
                    done('Lagring feilet');
                } else {
                    this.saveComponent.manualSaveComplete('Lagring feilet');
                }
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

        if (this.employee.BankAccounts.length && !this.employee.BankAccounts[0].ID) {
            this.employee.BankAccounts[0]['_createguid'] = this.employeeService.getNewGuid();
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

    private saveEmployments() {
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
        }, this.errorService.handle);
    }

    private saveRecurringPosts() {
        super.getStateSubject('recurringPosts').take(1).subscribe((recurringPosts: SalaryTransaction[]) => {
            let changeCount = 0;
            let saveCount = 0;
            let hasErrors = false;

            recurringPosts
                .filter(post => post['_isDirty'] || post.Deleted)
                .forEach((post, index) => {
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

                    let source = (post.ID > 0)
                        ? this.salaryTransService.Put(post.ID, post)
                        : this.salaryTransService.Post(post);

                    source.finally(() => {
                        if (saveCount === changeCount) {
                            this.saveStatus.completeCount++;
                            if (hasErrors) {
                                this.saveStatus.hasErrors = true;
                            } else {
                                super.updateState('recurringPosts', recurringPosts.filter(x => !x.Deleted), false);
                            }
                            this.checkForSaveDone();
                        }
                    })
                        .subscribe(
                        (res: SalaryTransaction) => {
                            saveCount++;
                            recurringPosts[index] = res;
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
                });
        }, this.errorService.handle);
    }

    private saveEmployeeLeave() {
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
        }, this.errorService.handle);
    }

}
