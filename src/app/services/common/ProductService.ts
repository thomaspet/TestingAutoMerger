import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Product} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

export class ProductService extends BizHttp<Product> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Product.RelativeUrl;

        this.DefaultOrderBy = 'PartName';
    }   
        
    public calculatePrice(product: Product): Observable<any> {        
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(product)
            .withEndPoint(this.relativeURL + '?action=calculateprice')
            .send();     
    }
    
    public getNewPartname(): Observable<string> {
        return super.GetAction(null, 'getnewpartname');
    }
    
    public getStatusText(statusCode: number): string {
        let statusText = ''; 
        if (!statusCode) {
            statusText = 'Kladd';
        } else {
            statusText = 'Aktiv';
        }
        
        return statusText;
    }
}