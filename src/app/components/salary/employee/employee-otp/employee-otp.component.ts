import { Component, SimpleChanges } from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { Router, ActivatedRoute } from '@angular/router';
import { UniCacheService, EmployeeService, ErrorService, FinancialYearService } from '@app/services/services';
import { BehaviorSubject } from 'rxjs';
import { Employee, LocalDate } from '@uni-entities';

const EMPLOYEE_KEY = 'employee';

@Component({
    selector: 'employee-otp',
    templateUrl: './employee-otp.component.html'
})
export class EmployeeOTPComponent extends UniView {

    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public employee$: BehaviorSubject<Employee> = new BehaviorSubject(new Employee());
    public currentYear: number;

    constructor(
        private router: Router,
        cacheService: UniCacheService,
        route: ActivatedRoute,
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private financialYearService: FinancialYearService
    ) {
        super(router.url, cacheService);

        this.currentYear = this.financialYearService.getActiveYear();

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
            .map((employee: Employee) => {
                if (changes['IncludeOtpUntilMonth']) {
                    if (changes['IncludeOtpUntilMonth'].currentValue > 0) {
                        employee.IncludeOtpUntilYear = this.currentYear;
                    } else {
                        employee.IncludeOtpUntilYear = 0;
                    }
                }
                return employee;
            })
            .subscribe(employee => super.updateState(EMPLOYEE_KEY, employee, true));
    }
}
