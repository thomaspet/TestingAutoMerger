import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice, StatusCodeSupplierInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {InvoicePaymentData} from '../../models/sales/InvoicePaymentData';
import {Observable} from 'rxjs/Observable';

declare var moment;

@Injectable()
export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeSupplierInvoice.Draft, Text: 'Kladd'},
        { Code: StatusCodeSupplierInvoice.ForApproval, Text: 'For godkjenning' },
        { Code: StatusCodeSupplierInvoice.Approved, Text: 'Godkjent' },
        { Code: StatusCodeSupplierInvoice.Journaled, Text: 'Bokført' },
        { Code: StatusCodeSupplierInvoice.ToPayment, Text: 'Til betaling' },
        { Code: StatusCodeSupplierInvoice.PartlyPayed, Text: 'Delvis betalt' },
        { Code: StatusCodeSupplierInvoice.Payed, Text: 'Betalt' }
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
}
