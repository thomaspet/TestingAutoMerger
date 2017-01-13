import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Product} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ProductService extends BizHttp<Product> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

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

    public calculatePriceLocal(product: Product): Product {
        if (product.VatType) {
            if (product.CalculateGrossPriceBasedOnNetPrice) {
                product.PriceExVat = product.PriceIncVat / ((100 + product.VatType.VatPercent) / 100);
            } else {
                product.PriceIncVat = (product.PriceExVat * (100 + product.VatType.VatPercent)) / 100;
            }
        } else {
            if (product.CalculateGrossPriceBasedOnNetPrice) {
                product.PriceExVat = product.PriceIncVat;
            } else {
                product.PriceIncVat = product.PriceExVat;
            }
        }

        return product;
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
