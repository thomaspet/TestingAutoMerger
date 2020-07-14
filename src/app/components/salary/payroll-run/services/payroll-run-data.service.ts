import { Injectable } from '@angular/core';
import { StatisticsService } from '@app/services/services';
import { Observable, of, forkJoin } from 'rxjs';
import { SalaryTransaction, SalBalType } from '@uni-entities';
import { map } from 'rxjs/operators';

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

    public getSalaryPayBase(runID: number): Observable<number> {
        if (!runID) {
            return of(0);
        }
        return forkJoin(
                this.getSalaryTransactionPayBase(runID),
                this.getSalaryBalancePayBase(runID),
            )
            .pipe(
                map(result => result.reduce((acc, current) => acc + current, 0))
            );
    }

    private getSalaryTransactionPayBase(runID: number): Observable<number> {
        return this.statisticsService
            .GetAllUnwrapped(
                `model=SalaryTransaction`
            +   `&select=sum(Sum) as sum`
            +   `&filter=`
                +   `Wagetype.Base_Payment ne 0 `
                +   `and Wagetype.IncomeType ne 'Forskuddstrekk' `
                +   `and PayrollRunID eq ${runID}`
            +   `&expand=Wagetype`
            )
            .pipe(map(data => data[0]?.sum || 0));
    }

    private getSalaryBalancePayBase(runID: number) {
        if (!runID) {
            return of(0);
        }
        return this.statisticsService
            .GetAllUnwrapped(
                `select=sum(SalaryTransaction.Sum) as sum`
            +   `&model=SalaryBalanceLine`
            +   `&expand=SalaryBalance,SalaryTransaction`
            +   `&filter=`
            +       `SalaryBalance.InstalmentType ne ${SalBalType.Advance} `
            +       `and isnull(SalaryBalance.SupplierID,0) ne 0 `
            +       `and SalaryTransaction.PayrollRunID eq ${runID}`
            )
            .pipe(
                map(data => -data[0]?.sum || 0)
            );
    }
}
