import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice, StatusCodeSupplierInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {InvoicePaymentData} from '../../models/sales/InvoicePaymentData';
import {Observable} from 'rxjs/Observable';
import {URLSearchParams} from '@angular/http';

declare var moment;


@Injectable()
export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeSupplierInvoice.Draft, Text: 'Kladd', isPrimary: true},
        { Code: StatusCodeSupplierInvoice.ForApproval, Text: 'For godkjenning', isPrimary: false },
        { Code: StatusCodeSupplierInvoice.Approved, Text: 'Godkjent', isPrimary: true },
        { Code: StatusCodeSupplierInvoice.Journaled, Text: 'Bokført', isPrimary: true },
        { Code: StatusCodeSupplierInvoice.ToPayment, Text: 'Til betaling', isPrimary: false },
        { Code: StatusCodeSupplierInvoice.PartlyPayed, Text: 'Delvis betalt', isPrimary: false },
        { Code: StatusCodeSupplierInvoice.Payed, Text: 'Betalt', isPrimary: true }
    ];

    constructor(http: UniHttp) {
        super(http);
        
        this.relativeURL = SupplierInvoice.RelativeUrl;
        
        this.entityType = SupplierInvoice.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public getStatusText(statusCode: number): string {
        var text = 'Udefinert';
        this.statusTypes.forEach((status) => {
            if (status.Code === statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };

    public assign(supplierInvoiceId: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=assign`)
            .send()
            .map(response => response.json());
    }

    public journal(supplierInvoiceId: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=journal`)
            .send()
            .map(response => response.json());
    }

    public sendForPayment(supplierInvoiceId: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}`)
            .send()
            .map(response => response.json());
    }

    public payinvoice(supplierInvoiceId: number, supplierInvoiceData: InvoicePaymentData) {
        return this.http
            .asPUT()
            .withBody(supplierInvoiceData)
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=payInvoice`)
            .send()
            .map(response => response.json());
    }
    
    public getInvoiceSummary(odatafilter: string): Observable<any> {        
        return this.http 
            .asGET()
            .usingBusinessDomain()            
            .withEndPoint(this.relativeURL + '?action=get-supplier-invoice-summary&odataFilter=' + odatafilter) 
            .send()
            .map(response => response.json());
    }
    
    public newSupplierInvoice(): Promise<SupplierInvoice> {       
        return new Promise(resolve => {
            this.GetNewEntity([], SupplierInvoice.EntityType).subscribe((invoice: SupplierInvoice) => {
                invoice.CreatedBy = '-';
                invoice.CurrencyCode = 'NOK';
          
                resolve(invoice);                
            });               
        });
    }

    public getStatQuery(route: string): Observable<any> {
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.json().Data);        
    }

    public getInvoiceList(urlSearchParams: URLSearchParams): Observable<any> {
        var flds = this.selectBuilder('ID', 'StatusCode', 
            'Supplier.SupplierNumber', 'Info.Name', 'PaymentDueDate', 
            'InvoiceNumber', 'BankAccount', 'PaymentInformation', 'TaxInclusiveAmount',
            'PaymentID', 'JournalEntry.JournalEntryNumber',
            'RestAmount', 'Project.Name', 'Project.Projectnumber', 'Department.Name', 
            'Department.DepartmentNumber');
        var route = '?model=SupplierInvoice' + 
            '&select=' + flds + 
            '&expand=supplier.info,journalentry,dimensions.project,dimensions.department' + 
            '&orderby=id desc' +
            '&filter=( isnull(deleted,0) eq 0 )';

        if (urlSearchParams) {
            let filter = urlSearchParams.get('filter');
            if (filter) {
                route += ` and ( ${filter} )`;
            }
        }

        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.json().Data);
    }

    public getInvoiceListGroupedTotals(): Observable<Array<IStatTotal>> {
        var route = '?model=supplierinvoice&select=count(id),statuscode,sum(TaxInclusiveAmount),sum(RestAmount)&filter=isnull(deleted,0) eq 0';
        return this.http.asGET().usingStatisticsDomain()
        .withEndPoint(route).send()
        .map(response => response.json().Data);
    }

    private selectBuilder(...args: any[]): string {
        var select = '';
        var alias = '', item = '';
        for (var i = 0; i < args.length; i++) {
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
