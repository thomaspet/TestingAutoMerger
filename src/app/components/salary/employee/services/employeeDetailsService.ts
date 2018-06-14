import {Injectable, Type} from '@angular/core';
import {Router} from '@angular/router';
import {IToolbarSearchConfig} from '../../../common/toolbar/toolbarSearch';
import {Employee, UniEntity, SalaryBalance} from '../../../../unientities';
import {EmployeeService, ErrorService, SalarybalanceService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';

export interface ISaveInfo {
    newAfterSave: Type<UniEntity>;
}

@Injectable()
export class EmployeeDetailsService {

    constructor(
        private employeeService: EmployeeService,
        private errorService: ErrorService,
        private router: Router,
        private salaryBalanceService: SalarybalanceService
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
