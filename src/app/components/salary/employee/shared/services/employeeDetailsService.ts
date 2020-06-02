import {Injectable, Type} from '@angular/core';
import {Router} from '@angular/router';
import { tap } from 'rxjs/operators';
import { UniEntity, CompanySalary, Employee, SalaryBalance } from '@uni-entities';
import { EmployeeService, ErrorService, SalarybalanceService, CompanySalaryService } from '@app/services/services';
import { IToolbarSearchConfig } from '@app/components/common/toolbar/toolbar';
import { Observable, of } from 'rxjs';

export interface ISaveInfo {
    newAfterSave: Type<UniEntity>;
}

@Injectable()
export class EmployeeDetailsService {
    private companySalary: CompanySalary;
    constructor(
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private router: Router,
        private salaryBalanceService: SalarybalanceService,
        private companySalaryService: CompanySalaryService,
    ) {}

    public setupToolbarSearchConfig(emp: Employee): IToolbarSearchConfig {
        const info = emp.BusinessRelationInfo;
        return {
            lookupFunction: (query) => this.employeeService.GetAll(
                `filter=ID ne ${emp.ID} and (startswith(EmployeeNumber, '${query}') `
                    + `or (BusinessRelationID gt 0 and contains(BusinessRelationInfo.Name, '${query}')))`
                    + `&top=50&hateoas=false`,
                ['BusinessrelationInfo']
            ).catch((err, obs) => this.errorService.handleRxCatch(err, obs)),
            itemTemplate: (item) => `${item.EmployeeNumber} - `
                + `${item.BusinessRelationInfo && item.BusinessRelationInfo.Name}`,
            initValue: emp && emp.EmployeeNumber
                ? `${emp.EmployeeNumber} - ${(info && info.Name) || 'Ansatt'}`
                : 'Ny ansatt',
            onSelect: selected => this.router.navigate(['salary/employees/' + selected.ID])
        };
    }

    public newEntity(type: Type<UniEntity>, employee: Employee): Observable<any> {
        switch (type) {
            case SalaryBalance:
            return this.createSalaryBalance(employee.ID);
        }

        return Observable.of(null);
    }

    public getCompanySalary(): Observable<CompanySalary> {
        return this.companySalary
            ? of(this.companySalary)
            : this.companySalaryService
                .getCompanySalary()
                .pipe(
                    tap(companySalary => this.companySalary = companySalary)
                );
    }

    public cleanUp() {
        this.companySalary = null;
    }

    private createSalaryBalance(empID: number) {
        return this.salaryBalanceService
            .GetNewEntity()
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .map((salarybalance: SalaryBalance) => {
                salarybalance.EmployeeID = empID;
                salarybalance['_createguid'] = this.salaryBalanceService.getNewGuid();
                salarybalance.FromDate = new Date();
                return salarybalance;
            });
    }
}
