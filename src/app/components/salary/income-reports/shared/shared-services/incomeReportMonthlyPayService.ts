import { Injectable } from '@angular/core';
import { StatisticsService } from '@app/services/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class IncomeReportMonthlyPayService {

    constructor(private statisticsService: StatisticsService) {}

    public getMonthlyPayforEmployment(employmentID: number): Observable<number> {
        return this.statisticsService
            .GetAll(
                `Select=MonthRate as MonthRate,HoursPerWeek as HoursPerWeek,HourRate as HourRate,WorkPercent as WorkPercent&` +
                `model=Employment&` +
                `filter=ID eq ${employmentID}`
            ).pipe(
                map(empData => empData.Data[0]));
    }

}

