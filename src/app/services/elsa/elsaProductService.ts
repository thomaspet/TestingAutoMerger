import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaProduct, ElsaPurchase} from '@app/services/elsa/elsaModels';


@Injectable()
export class ElsaProductService {
    constructor(private uniHttp: UniHttp) {}

    public Get(id: number): Observable<ElsaProduct> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${id}`)
            .send()
            .map(req => req.json());
    }

    public GetAll(): Observable<ElsaProduct[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/products')
            .send()
            .map(req => req.json());
    }

    public FindProductByName(name: string): Observable<ElsaProduct> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint('/api/products')
            .send()
            .map(res => res && res.json())
            .map(products => {
                return products.find(product => product.name === name);
            });
    }

    public PurchaseProductOnCurrentCompany(product: ElsaProduct): Observable<ElsaPurchase> {
        return this.uniHttp
            .asPOST()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${product.id}/purchase`)
            .send()
            .map(req => req.json());
    }

    public ProductTypeToPriceText(product: ElsaProduct): string {
        let text = [''];
        if (product.isPerUser) {
            text.push('per bruker');
        }
        if (product.isMonthly) {
            text.push('per måned');
        }
        if (product.isPerTransaction) {
            text.push('per transaksjon');
        }
        return text.join(' / ');
    }
}
