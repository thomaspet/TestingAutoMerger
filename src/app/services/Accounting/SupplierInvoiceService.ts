import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {InvoicePaymentData} from '../../models/sales/InvoicePaymentData';
import {Observable} from 'rxjs/Observable';

export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    constructor(http: UniHttp) {
        super(http);
        
        // TODO: should resolve this from configuration based on type (ISupplierInvoice)? Frank is working on something..
        this.relativeURL = SupplierInvoice.RelativeUrl;
        
        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    // TODO: To be retrieved from database schema shared.Status instead?
    public StatusTypes: Array<any> = [
        { Code: '1', Text: 'Kladd' },
        { Code: '10000', Text: 'Kladd' },
        { Code: '10001', Text: 'Kladd' },
        { Code: '20000', Text: 'Pending' },
        { Code: '30000', Text: 'Active' },
        { Code: '40000', Text: 'Fullført' },
        { Code: '50000', Text: 'InActive' },
        { Code: '60000', Text: 'Deviation' },
        { Code: '70000', Text: 'Error' },
        { Code: '90000', Text: 'Deleted' },

        { Code: '2', Text: 'For godkjenning' },
        { Code: '30002', Text: 'For godkjenning' },
        { Code: '30003', Text: 'Godkjent' },
        { Code: '30004', Text: 'Bokført' },
        { Code: '30005', Text: 'Til betaling' },
        { Code: '30006', Text: 'Delvis betalt' },
        { Code: '30007', Text: 'Betalt' },
    ];

    public getStatusText = (StatusCode: string) => {
        var text = 'Udefinert';
        this.StatusTypes.forEach((status) => {
            if (status.Code == StatusCode) {
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
            .send();
    }

    public journal(supplierInvoiceId: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=journal`)
            .send();
    }

    public sendForPayment(supplierInvoiceId: number) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}`)
            .send();
    }

    public payinvoice(supplierInvoiceId: number, supplierInvoiceData: InvoicePaymentData) {
        return this.http
            .asPUT()
            .withBody(supplierInvoiceData)
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}/${supplierInvoiceId}?action=payInvoice`)
            .send();
    }
    
    public getInvoiceSummary(odatafilter: string): Observable<any> {        
        return this.http 
            .asGET()
            .usingBusinessDomain()            
            .withEndPoint(this.relativeURL + '?action=get-supplier-invoice-summary&odataFilter=' + odatafilter) 
            .send();
    } 
}
