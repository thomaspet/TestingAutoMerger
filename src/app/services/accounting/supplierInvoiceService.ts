import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice, StatusCodeSupplierInvoice, Team, User, InvoicePaymentData} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {ErrorService} from '../common/errorService';
import {StatusCode} from '../../../app/components/sales/salesHelper/salesEnums';

@Injectable()
export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeSupplierInvoice.Draft, Text: 'Opprettet', isPrimary: true},
        { Code: StatusCodeSupplierInvoice.ForApproval, Text: 'Tildelt', isPrimary: false },
        { Code: StatusCodeSupplierInvoice.Rejected, Text: 'Avvist', isPrimary: false},
        { Code: StatusCodeSupplierInvoice.Approved, Text: 'Godkjent', isPrimary: true },
        { Code: StatusCodeSupplierInvoice.Journaled, Text: 'Bokført', isPrimary: true },
        { Code: StatusCode.Completed, Text: 'Arkivert', isPrimary: false},
        { Code: StatusCode.Deleted, Text: 'Slettet', isPrimary: false }
    ];

    public paymentStatusCodes = [
        { Code: 30109, Text: 'Ubetalt'},
        { Code: 30110, Text: 'Overført til bank'},
        { Code: 30111, Text: 'Delbetalt'},
        { Code: 30112, Text: 'Betalt'}
    ];

    constructor(http: UniHttp, private errorService: ErrorService) {
        super(http);
        super.disableCache();

        this.relativeURL = SupplierInvoice.RelativeUrl;

        this.entityType = SupplierInvoice.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    getStatusText(statusCode: number): string {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType && statusType.Text || '';
    }

    getPaymentStatusText(statusCode: number): string {
        const statusType = this.paymentStatusCodes.find(x => x.Code === statusCode);
        return statusType && statusType.Text || '';
    }

    public getTeamsAndUsers(): Observable<{ teams: Array<Team>, users: Array<User>} >  {

        const obsTeams = this.http.asGET().usingBusinessDomain()
            .withEndPoint('teams/?expand=positions&hateoas=false&orderby=name&filter=positions.position ge 12').send()
            .map(response => response.body);

        const obsUsers = this.http.asGET().usingBusinessDomain()
            .withEndPoint('users/?hateoas=false?orderby=displayname&filter=statuscode eq 110001').send()
            .map(response => response.body);

        return Observable.forkJoin( obsTeams, obsUsers )
            .switchMap( result => {
                 return Observable.of({
                     teams: result[0],
                     users: result[1]
                });
            });
    }

    public reAssign(supplierInvoiceId: number, details: AssignmentDetails): Observable<boolean> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(details)
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=reAssign-to`)
            .send()
            .map(response => response.body);
    }

    public assign(supplierInvoiceId: number, details: AssignmentDetails): Observable<boolean> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(details)
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=assign-to`)
            .send()
            .map(response => response.body);
    }

    public journal(supplierInvoiceId: number) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=journal`)
            .send()
            .map(response => response.body);
    }

    public sendForPaymentWithData(supplierInvoiceId: number, invoicePaymentData?: InvoicePaymentData) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .withBody(invoicePaymentData)
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=sendForPaymentWithPaymentData`)
            .send()
            .map(response => response.body);
    }

    public creditInvoiceJournalEntry(supplierInvoiceId: number) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=credit-supplierinvoice-journalentry&supplierInvoiceId=${supplierInvoiceId}`)
            .send()
            .map(response => response.body);
    }


    public payinvoice(supplierInvoiceId: number, supplierInvoiceData: InvoicePaymentData) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .withBody(supplierInvoiceData)
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=payInvoice`)
            .send()
            .map(response => response.body);
    }

    public sendForPayment(supplierInvoiceID: number) {
        super.invalidateCache();
        return this.http
        .asPUT()
        .usingBusinessDomain()
        .withEndPoint(this.relativeURL + `?action=sendForPayment&id=${supplierInvoiceID}`)
        .send()
        .map(response => response.body);
    }

    public getInvoiceSummary(odatafilter: string): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-supplier-invoice-summary&odataFilter=' + odatafilter)
            .send()
            .map(response => response.body);
    }

    public newSupplierInvoice(): Promise<SupplierInvoice> {
        return new Promise(resolve => {
            this.GetNewEntity([], SupplierInvoice.EntityType).subscribe((invoice: SupplierInvoice) => {
                invoice.CreatedBy = '-';
                invoice.CurrencyCodeID = 1;

                resolve(invoice);
            }, err => this.errorService.handle(err));
        });
    }

    public getStatQuery(route: string): Observable<any> {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.body.Data);
    }

    public getInvoiceList(httpParams: HttpParams, userIDFilter: string = ''): Observable<any> {

        if (userIDFilter !== '' && userIDFilter !== null) {
            userIDFilter = ' and user.id eq ' + userIDFilter;
        }

        const flds = this.selectBuilder(
            'ID', 'StatusCode', 'Supplier.SupplierNumber', 'IsSentToPayment', 'Info.Name',
            'PaymentDueDate', 'InvoiceDate', 'FreeTxt', 'InvoiceNumber',
            'stuff(user.displayname) as Assignees', 'BankAccount.AccountNumber',
            'PaymentInformation', 'TaxInclusiveAmount', 'TaxInclusiveAmountCurrency',
            'PaymentID', 'JournalEntry.JournalEntryNumber', 'RestAmount',
            'Project.Name', 'Project.Projectnumber', 'Department.Name',
            'Department.DepartmentNumber', 'CurrencyCodeID',
            'CurrencyCode.Code', 'CreatedAt', 'ReInvoice.StatusCode',
            'ReInvoice.ID', 'PaymentStatus'
        );

        let route = '?model=SupplierInvoice' +
            '&select=' + flds +
            '&join=supplierinvoice.id eq task.entityid and task.id eq approval.taskid and approval.userid eq user.id' +
            '&expand=supplier.info,journalentry,dimensions.project,dimensions.department,bankaccount,CurrencyCode,ReInvoice' +
            '&orderby=id desc' +
            '&filter=( isnull(deleted,0) eq 0 ' + (userIDFilter === null ? '' : userIDFilter)  + ' )';

        if (httpParams) {
            const filter = httpParams.get('filter');
            if (filter) {
                route += ` and ( ${filter} )`;
            }
            const top = httpParams.get('top');
            if (top) {
                route += '&top=' + top;
            }
        }
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.body.Data);
    }

    public getInvoiceListGroupedTotals(userIDFilter: string = ''): Observable<Array<IStatTotal>> {

        // tslint:disable-next-line:max-line-length
        const route = '?model=supplierinvoice&select=count(id),statuscode,sum(TaxInclusiveAmount),sum(RestAmount)' +
        '&filter=isnull(deleted,0) eq 0';
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.body.Data);
    }

    public getInvoiceListGroupedPaymentTotals(status: string = ''): Observable<Array<any>> {
        let route = '?model=supplierinvoice&select=count(id)&filter=PaymentStatus eq 30109';
        if (status === 'betalt') {
            route = '?model=supplierinvoice&select=count(id)&filter=PaymentStatus eq 30112';
        } else if (status === 'betalingsliste') {
            route = '?model=supplierinvoice&select=count(id)&filter=PaymentStatus eq 30110 OR PaymentStatus eq 30111';
        }
        return this.http
            .asGET()
            .withEndPoint(route).usingStatisticsDomain()
            .send()
            .map(response => response.body.Data );
    }

    public fetch(route: string, httpParams?: HttpParams): Observable<any> {
        return this.send(route, httpParams, 'GET');
    }

    public send(route: string, httpParams?: HttpParams, method = 'POST', body?: any): Observable<any> {
        let ht = this.http.asPOST();
        switch (method.toUpperCase()) {
            case 'GET':
                ht = this.http.asGET();
                break;
            case 'PUT':
                ht = this.http.asPUT();
                break;
            case 'DELETE':
                ht = this.http.asDELETE();
                break;
        }
        return ht.usingBusinessDomain()
        .withEndPoint(route).send( body ? { body: body } : undefined, httpParams)
        .map(response => response.body);
    }

    public checkInvoiceData(invoiceNumber: any, supplierID: number, ID?: number) {
        let endpoint = `?model=SupplierInvoice&filter=InvoiceNumber eq '${invoiceNumber}' and SupplierID eq '${supplierID}'`;
        endpoint += ID ? ` and ID ne '${ID}'` : '';
        return this.http.asGET()
        .usingStatisticsDomain()
        .withEndPoint(endpoint)
        .send()
        .map(response => response.body);
    }

    public isOCR(file: any): boolean {
        if (!file || !file.Name) { return false; }

        if (file.ContentType) {
            if (file.ContentType === 'application/xml') { return false; }
            if (file.ContentType.startsWith('image')) { return true; }
        }
        if (file.Extension && file.Extension === '.xml') { return false; }

        const ocrformats = ['pdf', 'png', 'jpeg', 'jpg', 'gif', 'tiff'];
        const ending = file.Name.toLowerCase().split('.').pop();

        return ocrformats.indexOf(ending) >= 0 || ending.indexOf('pdf') >= 0;
    }

    public isEHF(file: any): boolean {
        if (!file.Name) { return false; }

        const name = (file.Name || '').toLowerCase();
        const contenttype = (file.ContentType || '').toLowerCase();
        return name.indexOf('.ehf') !== -1 || contenttype.startsWith('bis/billing');
    }

    private selectBuilder(...args: any[]): string {
        let select = '';
        let alias = '', item = '';
        for (let i = 0; i < args.length; i++) {
            item = args[i];
            if ((item.indexOf(' as ') < 0) && ((item.indexOf('.') < 0))) {
                alias = item;
                item = item.toLowerCase() + ' as ' + alias;
            }
            select += (i > 0 ? ',' : '') + item;
        }
        return select;
    }
}


export interface IStatTotal {
    countid: number;
    SupplierInvoiceStatusCode: number;
    sumTaxInclusiveAmount: number;
    sumRestAmount: number;
}

export interface AssignmentDetails {
    Message?: string;
    TeamIDs?: number[];
    UserIDs?: number[];
    ApprovalRuleID?: number;
}
