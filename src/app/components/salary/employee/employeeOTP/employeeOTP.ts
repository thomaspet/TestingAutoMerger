import { Component, SimpleChanges } from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { Router, ActivatedRoute } from '@angular/router';
import { UniCacheService, EmployeeService, ErrorService } from '@app/services/services';
import { BehaviorSubject } from 'rxjs';
import { Employee, LocalDate } from '@uni-entities';

const EMPLOYEE_KEY = 'employee';

@Component({
    selector: 'employee-otp',
    templateUrl: './employeeotp.html'
})
export class EmployeeOTP extends UniView {

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public employee$: BehaviorSubject<Employee> = new BehaviorSubject(new Employee());

    constructor(
        private router: Router,
        cacheService: UniCacheService,
        route: ActivatedRoute,
        private employeeService: EmployeeService,
        private errorService: ErrorService
    ) {
        super(router.url, cacheService);

        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(this.router.url);
            super.getStateSubject(EMPLOYEE_KEY)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .subscribe(
                    (employee: Employee ) => {
                        if (employee.ID === 0 && !employee.EmployeeNumber) {
                            employee.EmployeeNumber = null;
                        }
                        this.employee$.next(employee);
                        this.setupFormConfig();
                    }
                );
        });
    }

    private setupFormConfig() {
        this.employeeService.layoutOTP('EmployeeOTPForm')
            .subscribe((layout: any) => {
                this.fields$.next(layout.Fields);
            });
    }

    public onFormReady(value) {
    }

    public onFormChange(changes: SimpleChanges) {
        this.employee$
            .asObservable()
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => {
                    const change = changes[key];
                    return change.previousValue !== change.currentValue;
                }))
            .map(employee => {
                return employee;
            })
            .subscribe(employee => super.updateState(EMPLOYEE_KEY, employee, true));
    }
}
