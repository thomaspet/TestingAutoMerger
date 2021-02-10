import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from '@app/services/common/errorService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { IncomeReportData, StatusCodeIncomeReport } from '@uni-entities';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable()
export class IncomeReportsService extends BizHttp<IncomeReportData> {

    constructor(
        public http: UniHttp,
        public statistics: StatisticsService,
        private errorService: ErrorService,
    ) {
        super(http);
        this.relativeURL = IncomeReportData.RelativeUrl;
        this.entityType = IncomeReportData.EntityType;

    }

    public getIncomeReportsCountByType(code?: number | null) {
        let statusCode = '';
        if (code) {
            statusCode = `&filter=StatusCode eq ${code}`;
        } else if (code === null) {
            statusCode = `&filter=isnull(StatusCode, 0) eq 0`;
        }
        return this.statistics.GetAllUnwrapped(`model=IncomeReportData&select=count(ID) as count${statusCode}`)
            .pipe(map(x => x[0].count));

    }

    public getIncomeReports(incomeReportStatus: string = '', urlParams: HttpParams): Observable<any> {
        let statusCodeFilter = '';
        switch (incomeReportStatus.toLowerCase()) {
            case 'opprettet': statusCodeFilter = 'incomereportdata.StatusCode eq ' + StatusCodeIncomeReport.Created;
                break;
            case 'innsendt': statusCodeFilter = 'incomereportdata.StatusCode eq ' + StatusCodeIncomeReport.Sent;
                break;
            case 'avvist': statusCodeFilter = 'incomereportdata.StatusCode eq ' + StatusCodeIncomeReport.Rejected;
                break;
        }
        let params = urlParams;

        if (params === null) {
            params = new HttpParams();
        }
        if (!params.get('filter')) {
            if (statusCodeFilter) {
                params = params.set('filter', `${statusCodeFilter}`);
            }
        } else if (params.get('filter')) {
            if (statusCodeFilter) {
                params = params.set('filter', params.get('filter') + ` and (${statusCodeFilter})`);
            }
        }
        if (!params.get('orderby')) {
            params = params.set('orderby', 'CreatedAt desc');
        }
        params = params.set('model', 'incomereportdata');
        params = params.set('select',
            'ID as ID,BusinessRelationInfo.Name as Name,IncomeReportData.MonthlyRefund as MonthlyRefund,' +
            'IncomeReportData.StatusCode as StatusCode,IncomeReportData.Type as Type,' +
            'AltinnReceipt.Timestamp as SentToAltinn,Employment.JobName as JobName,Employment.ID as EmploymentNo'
        );
        params = params.set('expand',
            'Employment,Employment.Employee,Employment.Employee.BusinessRelationInfo,AltinnReceipt'
        );

        return this.statistics.GetAllByHttpParams(params).pipe(
            catchError((err, obs) => this.errorService.handleRxCatch(err, obs))
        );

    }

    public deleteIncomeReport(ID: number): Observable<boolean> {
        return this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${ID}`)
            .send();
    }


    public getIncomeReport(id: number): Observable<any> {
        return super.Get(id);
    }

    public createIncomeReport(type: YtelseKodeliste, employmentId?: number): Observable<any> {
        let employmentFilter: string = '';
        if (employmentId) {
            employmentFilter = `&employmentID=${employmentId}`;
        }
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withEndPoint(this.relativeURL + `?action=create&type=${type}` + employmentFilter)
            .send()
            .map(response => response.body);
    }

    public sendIncomeReport(id: number) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=send`)
            .send()
            .map(response => response.body);
    }

    public getKontantytelsefromPayroll(employmentId: number, fromDate: Date, periods: number): Observable<any[]> {
        let monthlyPayFilter: string = '';

        if (!employmentId || !fromDate || !periods) {
            return Observable.of(null);
        }
        monthlyPayFilter = `&employmentID=${employmentId}&fromDate=${fromDate}&periods=${periods}`;

        return super.GetAction(null, 'monthly-pay', monthlyPayFilter);
    }

}

export enum YtelseKodeliste {
    None = 0,
    Sykepenger = 1,
    Foreldrepenger = 2,
    Svangerskapspenger = 3,
    Pleiepenger = 4,
    Omsorgspenger = 5,
    Opplaeringspenger = 6
}

