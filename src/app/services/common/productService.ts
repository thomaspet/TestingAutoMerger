import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import { Product, VatType } from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

@Injectable()
export class ProductService extends BizHttp<Product> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Product.RelativeUrl;
        this.entityType = Product.EntityType;
        this.DefaultOrderBy = 'PartName';
    }

    public calculatePriceLocal(product: Product, vattypes: VatType[]): Product {
        if (product.VatType) {
            const vatTypeFromList = vattypes.find(item => item.VatCode === product.VatType.VatCode)
            const vatPercent = product.VatType.VatPercent || (vatTypeFromList && vatTypeFromList.VatPercent);
            if (product.CalculateGrossPriceBasedOnNetPrice) {
                product.PriceExVat = product.PriceIncVat / ((100 + vatPercent || 100) / 100);
            } else {
                product.PriceIncVat = (product.PriceExVat * (100 + vatPercent || 100)) / 100;
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
}
