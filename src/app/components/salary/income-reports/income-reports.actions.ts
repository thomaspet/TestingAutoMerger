import { HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IncomeReportsService } from '@app/components/salary/income-reports/shared-services/incomeReportsService';
import { StatusCodeIncomeReport } from '@uni-entities';
import { forkJoin } from 'rxjs';

@Injectable()
export class IncomeReportsActions {
constructor(
    private incomeReportsService: IncomeReportsService,
    private router: Router
) {}

    getIncomeReportCounters() {
        return forkJoin([
            this.incomeReportsService.getIncomeReportsCountByType(StatusCodeIncomeReport.Created),
            this.incomeReportsService.getIncomeReportsCountByType(StatusCodeIncomeReport.Sendt),
            this.incomeReportsService.getIncomeReportsCountByType(49003),
            this.incomeReportsService.getIncomeReportsCountByType()
        ]);
    }

    navigateToNewIncomeReport() {
        return this.router.navigateByUrl('/salary/incomereports/incomereport/0');
    }

    loadIncomeReports(incomeReportStatus = '', params: HttpParams) {
        return this.incomeReportsService.getIncomeReports(incomeReportStatus, params);

    }
}
