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
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {AltinnAuthenticationData} from '../../models/AltinnAuthenticationData';
import {Subject} from 'rxjs/Subject';

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
        { Code: StatusCodeVatReport.Adjusted, Text: 'Korrigert' }
    ];

    constructor(http: UniHttp) {
        super(http);
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
            .map(response => response.json());
    }

    public getNextPeriod(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=next&periodid=${periodId}`)
            .send()
            .map(response => response.json());
    }

    public getPreviousPeriod(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=previous&periodid=${periodId}`)
            .send()
            .map(response => response.json());
    }

    public runReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=execute&periodid=${periodId}`)
            .send()
            .map(response => response.json());
    }

    public sendReport(vatReportId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=submit`)
            .send()
            .map(response => response.json());
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
            .map(response => response.json());
    }

    public getVatReportSummary(vatReportId: number, periodId: number): Observable<VatReportSummary[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${vatReportId}?action=get-vat-report-summary&periodID=${periodId}`)
            .send()
            .map(response => response.json());
    }

    public getVatReportSummaryPerPost(vatReportID: number, periodID: number): Observable<VatReportSummaryPerPost[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `/${vatReportID}?action=get-vat-report-summary-per-post&periodid=${periodID}`)
            .send()
            .map(response => response.json());
    }

    public getVatReportMessages(vatReportID: number, periodID: number): Observable<VatReportMessage[]> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `/${vatReportID}?action=control-vatreport&periodID=${periodID}`)
            .send()
            .map(response => response.json());
    }

    public getNotReportedJournalEntryData(periodID: number): Observable<VatReportNotReportedJournalEntryData> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(
                this.relativeURL + `?action=get-not-reported-journalentry-data&periodID=${periodID}`)
            .send()
            .map(response => response.json());
    }

    public createAdjustedVatReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/?action=create-adjusted-vatreport&periodId=${periodId}`)
            .send()
            .map(response => response.json());
    }

    public createAdditionalVatReport(vatReportId: number, periodId: number): Observable<VatReport> {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/?action=create-additional-vatreport&periodId=${periodId}`)
            .send()
            .map(response => response.json());
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
            .map(response => response.json());
    }

    public getStatusText = (statusCode: number) => {
        let statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    };

}
