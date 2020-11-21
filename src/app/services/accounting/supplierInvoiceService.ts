import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {InvoicePaymentData, StatusCodeSupplierInvoice, SupplierInvoice, Team, User} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {ErrorService} from '../common/errorService';
import {StatusCode} from '../../../app/components/sales/salesHelper/salesEnums';
import {RequestMethod} from '@uni-framework/core/http';

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
        { Code: 30112, Text: 'Betalt'},
        { Code: 30113, Text: 'I betalingsliste'}
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

    public sendForPaymentWithData(supplierInvoiceId: number, invoicePaymentData?: InvoicePaymentData, hash?: string) {
        super.invalidateCache();
        return this.http
            .asPOST()
            .withBody(invoicePaymentData)
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=sendForPaymentWithPaymentData` + (!!hash ? '&hash=' + hash : ''))
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

    public getJournalEntyLinesBySupplierID(supplierID: number, year: number) {
        return this.Action(null,
            'get-supplierinvoices-details',
            `id=null&supplierID=${supplierID}&fromdate=${year}-1-1&todate=${year}-12-31`,
            RequestMethod.Get
        );
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
            'ReInvoice.ID', 'PaymentStatus' // , 'InvoiceOriginType'
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
        let route = '?model=supplierinvoice&select=count(id)&filter=PaymentStatus eq 30109 and (statuscode ne 40001 and statuscode ne 40000)';
        if (status === 'betalt') {
            route = '?model=supplierinvoice&select=count(id)&filter=PaymentStatus eq 30112 and (statuscode ne 40001 and statuscode ne 40000)';
        } else if (status === 'betalingsliste') {
            route = '?model=supplierinvoice&select=count(id)&filter=(PaymentStatus eq 30110 OR PaymentStatus eq 30111 OR PaymentStatus eq 30113) and (statuscode ne 40001 and statuscode ne 40000)';
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

        const ocrformats = ['pdf', 'docx', 'png', 'jpeg', 'jpg', 'gif', 'tiff'];
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

    /* tslint:disable */
    public MD5(e) {
        function h(a, b) {
            var c, d, e, f, g;
            e = a & 2147483648;
            f = b & 2147483648;
            c = a & 1073741824;
            d = b & 1073741824;
            g = (a & 1073741823) + (b & 1073741823);
            return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
        }

        function k(a, b, c, d, e, f, g) {
            a = h(a, h(h(b & c | ~b & d, e), g));
            return h(a << f | a >>> 32 - f, b)
        }

        function l(a, b, c, d, e, f, g) {
            a = h(a, h(h(b & d | c & ~d, e), g));
            return h(a << f | a >>> 32 - f, b)
        }

        function m(a, b, d, c, e, f, g) {
            a = h(a, h(h(b ^ d ^ c, e), g));
            return h(a << f | a >>> 32 - f, b)
        }

        function n(a, b, d, c, e, f, g) {
            a = h(a, h(h(d ^ (b | ~c), e), g));
            return h(a << f | a >>> 32 - f, b)
        }

        function p(a) {
            var b = "",
                d = <any>"",
                c;
            for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
            return b
        }
        var f = [],
            q, r, s, t, a, b, c, d;
        e = function(a) {
            a = a.replace(/\r\n/g, "\n");
            for (var b = "", d = 0; d < a.length; d++) {
                var c = a.charCodeAt(d);
                128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
            }
            return b
        }(e);
        f = function(b) {
            var a, c = b.length;
            a = c + 8;
            for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
            a = (g - g % 4) / 4;
            e[a] |= 128 << g % 4 * 8;
            e[d - 2] = c << 3;
            e[d - 1] = c >>> 29;
            return e
        }(e);
        a = 1732584193;
        b = 4023233417;
        c = 2562383102;
        d = 271733878;
        for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
        return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
    };
    /* tslint:enable */
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
