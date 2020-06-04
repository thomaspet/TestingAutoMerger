import { Injectable } from '@angular/core';
import { StatisticsService } from '@app/services/services';
import { Observable } from 'rxjs';
import { SalaryTransaction, SalaryBalanceLine } from '@uni-entities';

@Injectable()
export class PayrollRunDataService {
    constructor(
        private statisticsService: StatisticsService,
    ) {}

    public getNegativeSalaryTransactionCount(payrollRunID: Number): Observable<number> {
        const negativeSalaryFilter =  `model=SalaryTransaction` +
                        `&select=EmployeeID as ID,EmployeeNumber as EmployeeNumber,BusinessRelationInfo.Name as Name,sum(Sum) as Sum` +
                        `&filter=PayrollRunID eq ${payrollRunID} and Wagetype.Base_Payment eq 1` +
                        `&having=sum(Sum) lt 0` +
                        `&expand=Employee.BusinessRelationInfo,WageType`;

        return this.statisticsService.GetAllUnwrapped(negativeSalaryFilter)
            .map((salaryTransaction: SalaryTransaction[]) => salaryTransaction.length);
    }
}
