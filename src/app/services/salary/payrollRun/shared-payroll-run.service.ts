import { Injectable } from '@angular/core';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { PayrollRun, PostingSummaryDraft, EmployeeCategory } from '@uni-entities';
import { Observable, forkJoin, of } from 'rxjs';
import { StatisticsService } from '@app/services/common/statisticsService';
import { FinancialYearService } from '@app/services/accounting/financialYearService';

enum StatusCodePayment {
    Queued = 44001,
    TransferredToBank = 44002, // Note: NOT in Use yet
    Failed = 44003,
    Completed = 44004,
    ReadyForTransfer = 44005,
    ReceiptParsed = 44006
}

export enum PayrollRunPaymentStatus {
    None = 0,
    SentToPayment = 1,
    PartlyPaid = 2,
    Paid = 3
}

export enum SalaryBookingType {
    Dimensions = 0,
    DimensionsAndBalance = 1,
    NoDimensions = 2,
}

export enum ActionOnPaymentReload {
    DoNothing = 0,
    SendToBank = 1,
    SentToBank = 2,
    SendToPaymentList = 3,
}


@Injectable()
export class SharedPayrollRunService extends BizHttp<PayrollRun> {
    readonly payStatusProp = '_payStatus';

    constructor(
        http: UniHttp,
        private statisticsService: StatisticsService,
        private financialYearService: FinancialYearService,
    ) {
        super(http);
        super.relativeURL = PayrollRun.RelativeUrl;
        super.entityType = PayrollRun.EntityType;
    }

    public getPostingSummaryDraft(ID: number): Observable<PostingSummaryDraft> {
        return super.GetAction(ID, 'postingsummarydraft');
    }

    public getAll(queryString: string, includePayments: boolean = false): Observable<PayrollRun[]> {
        const year = this.financialYearService.getActiveYear();

        let queryList = queryString.split('&');
        let filter = queryList.filter(x => x.toLowerCase().includes('filter'))[0] || '';
        filter = filter.toLowerCase();
        queryList = queryList.filter(x => !x.toLowerCase().includes('filter'));
        if (!filter.toLowerCase().includes('year(paydate)')) {
            filter = 'filter='
                + (filter ? `(${filter.replace('filter=', '')}) and ` : '')
                + `(year(PayDate) eq ${year})`;
        }

        queryList.push(filter);
        if (includePayments) {
            return this.GetAll(queryList.join('&'))
            .switchMap(runs =>
                runs.length ? forkJoin(
                    of(runs),
                    this.getPaymentsOnRun(runs, year)
                ) : Observable.of([])
            )
            .map((list) => {
                const [runs, payments] = list;
                return this.setPaymentStatusOnPayrollList(runs, payments);
            });
        }

        return this.GetAll(queryList.join('&'))
            .map(payrollRuns => this.setPaymentStatusOnPayrollList(payrollRuns));
    }

    public getLatestSettledRun(year?: number): Observable<PayrollRun> {
        return super.GetAll(`filter=StatusCode ge 1 ${
            year ? 'and year(PayDate) eq ' + year
            : ''
            }&top=1&orderby=PayDate DESC`)
            .map(resultSet => resultSet[0]);
    }

    public getEarliestOpenRunOrLatestSettled(setYear?: number): Observable<PayrollRun> {
        const currYear = setYear ? setYear : this.financialYearService.getActiveYear();

        return Observable.of(currYear)
            .switchMap(year => this.getEarliestOpenRun(year))
            .switchMap(run => run
                ? Observable.of(run)
                : this.getLatestSettledRun(currYear));
    }
    public getEarliestOpenRun(setYear?: number): Observable<PayrollRun> {

        const year = setYear ? setYear : this.financialYearService.getActiveYear();

        return super.GetAll(
                `filter=(StatusCode eq null or StatusCode le 1) and year(PayDate) eq ${year}`
                + `&top=1`
                + `&orderby=PayDate ASC`)
            .map(result => result[0]);
    }

    public saveCategory(id: number, category: EmployeeCategory) {
        const saveObs = category.ID ? this.http.asPUT() : this.http.asPOST();
        return saveObs
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + '/' + id + '/category/' + category.ID)
        .withBody(category)
        .send()
        .map(response => response.body);
    }

    public getPaymentsOnRun(runs: PayrollRun[], year: number) {
        return this.statisticsService.GetAll(
            `model=Tracelink`
            + `&select=PayrollRun.ID as ID,Payment.StatusCode as StatusCode,Payment.PaymentDate as PaymentDate,`
            + `sum(casewhen(Payment.StatusCode ne ${StatusCodePayment.Completed},1,0)) as notPaid,`
            + `sum(casewhen(Payment.StatusCode eq ${StatusCodePayment.Completed},1,0)) as paid`
            + `&filter=SourceEntityName eq 'PayrollRun' and DestinationEntityName eq 'Payment' and Payment.PaymentDate le '${year}-12-31T23:59:59Z' `
            + `and Payment.PaymentDate ge '${year}-01-01T00:00:01Z' and (${runs.map(x => 'PayrollRun.ID eq ' + x.ID).join(' or ')})`
            + `&join=Tracelink.DestinationInstanceId eq Payment.ID as Payment and Tracelink.SourceInstanceId eq PayrollRun.ID as PayrollRun`
        ).map(x => x.Data);
    }

    public getPaymentIDsQueuedOnPayrollRun(run: PayrollRun) {
        return this.statisticsService.GetAll(
            `model=Tracelink`
            + `&select=Payment.ID as PaymentID`
            + `&filter=SourceEntityName eq 'PayrollRun' and DestinationEntityName eq 'Payment' `
            + `and PayrollRun.ID eq ${run.ID} `
            + `and Payment.StatusCode eq ${StatusCodePayment.Queued}`
            + `&join=Tracelink.DestinationInstanceId eq Payment.ID as Payment and Tracelink.SourceInstanceId eq PayrollRun.ID as PayrollRun`
        ).map(x => x.Data);
    }


    private setPaymentStatusOnPayrollList(payrollRuns: PayrollRun[], payments?: any[]): PayrollRun[] {
        return payrollRuns
            ? payrollRuns
                .map(run => this.markPaymentStatus(run, payments ? payments.filter(p => p.ID === run.ID) : []))
            : [];
    }

    public markPaymentStatus(payrollRun: PayrollRun, payments?: any[]): PayrollRun {
        payments = payments || payrollRun['Payments'] || [];
        if (payments.length <= 0) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.None;
        } else if (payments.some(pay => !pay.paid && !!pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.SentToPayment;
        } else if (payments.some(pay => !!pay.paid && !!pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.PartlyPaid;
        } else if (payments.some(pay => !!pay.paid && !pay.notPaid)) {
            payrollRun[this.payStatusProp] = PayrollRunPaymentStatus.Paid;
        }
        return payrollRun;
    }
}
