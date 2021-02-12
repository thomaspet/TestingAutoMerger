import { Injectable } from '@angular/core';
import { FinancialYearService, StatisticsService } from '@app/services/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface IReportPickerEmployee {
    ID: number;
    EmployeeNumber: number;
    Name: string;
    EMail: string;
    _paycheckFormat?: PaycheckFormat;
    _categories?: string;
}
export enum PaycheckFormat {
    E_MAIL = 'E-post',
    PRINT = 'Utskrift'
}

@Injectable()
export class EmployeeReportPickerService {

    constructor(
        private statistics: StatisticsService,
        private yearService: FinancialYearService,
    ) { }

    public getAnnualStatementEmployees(year: number = this.yearService.getActiveYear()): Observable<IReportPickerEmployee[]> {
        return this.statistics
            .GetAllUnwrapped(
                `select=EmployeeID as ID,EmployeeNumber as EmployeeNumber,BusinessRelationInfo.Name as Name,DefaultEmail.EmailAddress as EMail` +
                `&model=SalaryTransaction` +
                `&join=SalaryTransaction.EmployeeID eq VacationPayLine.EmployeeID as Vacation` +
                `&filter=isnull(PayrollRunID,0) ne 0 `
                    + `and (`
                        +`(`
                            + `isnull(Vacation.Year,0) eq ${year} and isnull(Vacation.ManualVacationPayBase,0) ne 0`
                        +`) `
                        + `or isnull(Wagetype.IncomeType,'') ne '' `
                        + `or isnull(Wagetype.Benefit,'') ne '' `
                        + `or isnull(Wagetype.Description,'') ne ''`
                    + `) `
                    + `and year(PayrollRun.PayDate) eq ${year}` +
                `&expand=Employee.BusinessRelationInfo.DefaultEmail,WageType,PayrollRun` +
                `&distinct=true`
            )
            .pipe(
                map((result: any[]) => result
                    .map(r => ({
                        ID: r.ID,
                        EmployeeNumber: r.EmployeeNumber,
                        EMail: r.EMail,
                        Name: r.Name,
                    }))
                )
            )
    }
}
