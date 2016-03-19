import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SupplierInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from "rxjs/Observable";

export class SupplierInvoiceService extends BizHttp<SupplierInvoice> {

    constructor(http: UniHttp) {
        super(http);
        
        //TODO: should resolve this from configuration based on type (ISupplierInvoice)? Frank is working on something..
        this.relativeURL = SupplierInvoice.relativeUrl;
        
        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    //TODO: Kan ikke sette denne fast!! Feiler da på slik som Post
    //Midlertidig kode.
//    public getNewSupplierInvoice(expand?: string[]): Observable<any> {
////    public getNewSupplierInvoice(): Observable<any> {
//        this.relativeURL = 'supplierinvoice';
//        return this.GetNewEntity();
//    }

//    public saveNew<T>(entity: T): Observable<any> {
//        this.relativeURL = 'supplierinvoices';
//        return this.Post(entity);
//    }
}