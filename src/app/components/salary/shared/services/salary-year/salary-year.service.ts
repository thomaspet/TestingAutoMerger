import { Injectable } from '@angular/core';
import { FinancialYearService, StatisticsService } from '@app/services/services';
import { map } from 'rxjs/operators';

@Injectable()
export class SalaryYearService {

    constructor(
        private statisticsService: StatisticsService,
        private yearService: FinancialYearService,
    ) { }

    public hasYear(year = this.yearService.getActiveYear()) {
        return this.statisticsService
            .GetAllUnwrapped(`select=ID as ID&model=SalaryYear&filter=CurrentYear eq ${year}`)
            .pipe(
                map(years => !!years.length)
            );
    }
}
