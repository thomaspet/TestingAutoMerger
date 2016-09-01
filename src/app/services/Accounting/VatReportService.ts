import {BizHttp} from '../../../framework/core/http/BizHttp';
import {VatReport, VatReportMessage, VatReportSummaryPerPost, VatReportSummary, StatusCodeVatReport} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';

export class VatReportService extends BizHttp<VatReport> {

    constructor(http: UniHttp) {
        super(http);
        // TODO: should resolve this from configuration
        this.relativeURL = 'vatreports';
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

    private statusTypes: Array<any> = [
        { Code: StatusCodeVatReport.Executed, Text: 'Kjørt' },
        { Code: StatusCodeVatReport.Submitted, Text: 'Innsendt' },
        { Code: StatusCodeVatReport.Rejected, Text: 'Avvist' },
        { Code: StatusCodeVatReport.Approved, Text: 'Godkjent' },
    ];

    public getStatusText = (statusCode: number) => {
        var text = '';
        this.statusTypes.forEach((status) => {
            if (status.Code == statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };    

}
