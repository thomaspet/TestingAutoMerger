import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardDataService } from '../../../dashboard-data.service';
import { UniTranslationService } from '@app/services/services';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

export interface IPayrollRun {
    id: number;
    name: string;
    status: string;
    payDate: Date;
}
@Injectable()
export class RecentPayrollRunsService {

    constructor(
        private dataService: DashboardDataService,
        private translationService: UniTranslationService,
    ) { }

    getData(): Observable<IPayrollRun[]> {
        return this.dataService
            .get(`/api/statistics`
                + `?model=PayrollRun`
                + `&select=`
                    + `ID as id`
                    + `,${this.statusSelect()}`
                    + `,Description as name`
                    + `,PayDate as payDate`
                    + `,CreatedAt`
                + `&orderby=CreatedAt desc`
                + `&top=10`
                + `&filter=year(PayDate) eq activeyear()`
            )
            .pipe(
                map(result => result.Data.map(data => ({...data, payDate: data.payDate && moment(data.payDate).format('L')})))
            );
    }

    private statusSelect() {
        return `casewhen(`
            + `isnull(StatusCode, 0) eq 0`
            + `,'${this.translationService.translate('STATUSES.PAYROLL_RUN.CREATED')}'`
            + `,casewhen(StatusCode eq 1`
                + `,'${this.translationService.translate('STATUSES.PAYROLL_RUN.CALCULATED')}'`
                + `,'${this.translationService.translate('STATUSES.PAYROLL_RUN.BOOKED')}'`
            + `)`
        + `) as status`;
    }
}
