import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {
    VatReport,
    VatReportMessage,
    VatReportSummaryPerPost,
    VatReportSummary,
    AltinnGetVatReportDataFromAltinnResult,
    StatusCodeVatReport,
    VatReportNotReportedJournalEntryData,
    AltinnSigning
} from '../../unientities';
import { StatisticsService } from '@app/services/common/statisticsService';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {AltinnAuthenticationData} from '../../models/AltinnAuthenticationData';
import {Subject} from 'rxjs';

@Injectable()
export class VatReportService extends BizHttp<VatReport> {

    private vatreport: Subject<VatReport> = new Subject<VatReport>();
    public refreshVatReport$: Observable<VatReport> = this.vatreport.asObservable();

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeVatReport.Executed, Text: 'Kjørt' },
        { Code: StatusCodeVatReport.Submitted, Text: 'Innsendt' },
        { Code: StatusCodeVatReport.Rejected, Text: 'Avvist' },
        { Code: StatusCodeVatReport.Approved, Text: 'Godkjent' },
        { Code: StatusCodeVatReport.Adjusted, Text: 'Korrigert' },
        { Code: StatusCodeVatReport.Cancelled, Text: 'Angret' }
    ];

    constructor(
        http: UniHttp,
        private statisticsService: StatisticsService
        ) {
        super(http);
        super.disableCache();

        this.relativeURL = VatReport.RelativeUrl;
        this.entityType = VatReport.EntityType;
    }

    public refreshVatReport(vatReport: VatReport) {
        return this.vatreport.next(vatReport);
    }

    public getCurrentPeriod(): Observable<VatReport> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=current`)
            .send()
            .map(response => response.body);
    }

    public getPeriodStatus(periodID: number): Observable<any> {
        return this.statisticsService.GetAll(`model=VatReport&select=ID as ID,StatusCode as StatusCode,VatReportTypeID as VatReportTypeID,Title as Title&` +
                    `filter=TerminPeriodID eq '${periodID}'&orderby=ID DESC`)
                    .map(x => x.Data ? x.Data[0] : []);
    }

    public getNextPeriod(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=next&periodid=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public getPreviousPeriod(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=previous&periodid=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public runReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=execute&periodid=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public undoReport(vatReportId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=undo-execute&vatReportId=${vatReportId}`)
            .send()
            .map(response => response.body);
    }

    public undoPeriod(periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${periodId}?action=undo-execute-period&periodId=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public sendReport(vatReportId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=submit`)
            .send()
            .map(response => response.body);
    }


    public getSigningText(vatReportId: number, authenticationData: AltinnAuthenticationData): Observable<any> {
        const headers = {
            'x-altinn-userid': authenticationData.userID,
            'x-altinn-password': authenticationData.password,
            'x-altinn-pinmethod': authenticationData.preferredLogin,
            'x-altinn-pin': authenticationData.pin
        };

        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(this.relativeURL + `?action=get-signing-text-altinn&vatReportID=${vatReportId}`)
            .send()
            .map(response => response.body);
    }

    public signReport(vatReportId: number, authenticationData: AltinnAuthenticationData): Observable<AltinnSigning> {
        const headers = {
            'x-altinn-userid': authenticationData.userID,
            'x-altinn-password': authenticationData.password,
            'x-altinn-pinmethod': authenticationData.preferredLogin,
            'x-altinn-pin': authenticationData.pin
        };

        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(this.relativeURL + `?action=sign-vatreport-altinn&vatReportID=${vatReportId}`)
            .send()
            .map(response => response.body);
    }

    public payVat(vatReportId: number): Observable<any> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=pay-vat&vatReportId=${vatReportId}`)
            .send()
            .map(response => response.body);
    }

    public getVatReportSummary(vatReportId: number, periodId: number): Observable<VatReportSummary[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=get-vat-report-summary&periodID=${periodId}`)
            .send()
            .map(response => response.body);
    }

      public getVatReportSummaryFromPreviousPeriods(vatReportId: number, periodId: number): Observable<VatReportSummary[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=get-vat-report-summary-from-previous-periods&periodID=${periodId}`)
            .send()
            .map(response => response.body);
    }


    public getVatReportSummaryPerPost(vatReportID: number, periodID: number): Observable<VatReportSummaryPerPost[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `/${vatReportID}?action=get-vat-report-summary-per-post&periodid=${periodID}`)
            .send()
            .map(response => response.body);
    }

    public getVatReportMessages(vatReportID: number, periodID: number): Observable<VatReportMessage[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `/${vatReportID}?action=control-vatreport&periodID=${periodID}`)
            .send()
            .map(response => response.body);
    }

    public getNotReportedJournalEntryData(periodID: number): Observable<VatReportNotReportedJournalEntryData> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `?action=get-not-reported-journalentry-data&periodID=${periodID}`)
            .send()
            .map(response => response.body);
    }

    public createAdjustedVatReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/?action=create-adjusted-vatreport&periodId=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public createAdditionalVatReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/?action=create-additional-vatreport&periodId=${periodId}`)
            .send()
            .map(response => response.body);
    }

    public tryToReadAndUpdateVatReportData(vatReportID: number, authenticationData: AltinnAuthenticationData): Observable<AltinnGetVatReportDataFromAltinnResult> {
        const headers = {
            'x-altinn-userid': authenticationData.userID,
            'x-altinn-password': authenticationData.password,
            'x-altinn-pinmethod': authenticationData.preferredLogin,
            'x-altinn-pin': authenticationData.pin
        };
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withHeaders(headers)
            .withEndPoint(`${this.relativeURL}?action=read-and-update-altinn-vatreport-data&vatReportID=${vatReportID}`)
            .send()
            .map(response => response.body);
    }

    public getStatusText(statusCode: number) {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public getStatusClassName(statusCode: number) {
        switch (statusCode) {
            case StatusCodeVatReport.Approved:
                return 'success';
            default:
                return '';
        }
    }


    public getPaymentStatus(vatReportID: number, defaultPaymentStatus: string = 'Ikke betalt'): Observable<any> {
        return Observable.forkJoin(
            this.statisticsService.GetAll(`model=Tracelink&filter=DestinationEntityName eq 'Payment' `
                + `and SourceEntityName eq 'VatReport' and VatReport.ID eq ${vatReportID}`
                + `&join=Tracelink.SourceInstanceId eq VatReport.ID and Tracelink.DestinationInstanceId eq Payment.ID`
                + `&select=Payment.StatusCode as StatusCode`)
        ).map(responses => {
            const payments: Array<any> = responses[0].Data ? responses[0].Data : [];
            let statusText = defaultPaymentStatus;
            if (payments.length > 0)
            {
                const statusCode = payments[0].StatusCode;
                switch (statusCode) {
                    case 44001:
                    case 44002:
                    case 44005:
                    case 44007:
                    case 44008:
                    case 44009:
                    case 44011:
                    case 44015:
                    case 44016:
                        return 'Sendt til betaling';
                    case 44004:
                    case 44006:
                    case 44018:
                        return 'Betalt';
                    default:
                        return statusText;
                }
            }
            return statusText;
        });
    }
}
