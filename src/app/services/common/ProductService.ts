import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Product} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

export class ProductService extends BizHttp<Product> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Product.RelativeUrl;

        this.entityType = Product.EntityType;

        this.DefaultOrderBy = 'PartName';
    }   
        
    public calculatePrice(product: Product): Observable<any> {        
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(product)
            .withEndPoint(this.relativeURL + '?action=calculateprice')
            .send()
            .map(response => response.json());
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
    
    public next(currentID: number): Observable<Product>
    {
        return super.GetAction(currentID, 'next');
    }
    
    public previous(currentID: number): Observable<Product>
    {
        return super.GetAction(currentID, 'previous');
    }
}
