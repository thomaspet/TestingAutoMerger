import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaProduct, ElsaPurchase} from '@app/services/elsa/elsaModels';

@Injectable()
export class ElsaProductService {
    private cache: {[endpoint: string]: Observable<Response>} = {};

    constructor(private uniHttp: UniHttp) {}

    public invalidateCache() {
        this.cache = {};
    }

    private requestData(endpoint: string) {
        let request = this.cache[endpoint];
        if (!request) {
            request = this.uniHttp
                .asGET()
                .usingElsaDomain()
                .withEndPoint(endpoint)
                .send()
                .publishReplay(1)
                .refCount();

            this.cache[endpoint] = request;
        }

        return request.map(res => res.json());
    }

    public Get(id: number): Observable<ElsaProduct> {
        return this.requestData(`/api/products/${id}`);
    }

    public GetAll(): Observable<ElsaProduct[]> {
        return this.requestData('/api/products');
    }

    public FindProductByName(name: string): Observable<ElsaProduct> {
        return this.requestData('/api/products').map(products => {
            return products.find(product => product.name === name);
        });
    }

    public PurchaseProductOnCurrentCompany(product: ElsaProduct): Observable<ElsaPurchase> {
        // Shouldnt't need to invalidateCache here, since we're not actually
        // changing anything on products, only adding a purchase.
        // (bad practice to do it here, but this should be temporary until elsa is refactored..)
        return this.uniHttp
            .asPOST()
            .usingElsaDomain()
            .withEndPoint(`/api/products/${product.id}/purchase`)
            .send()
            .map(req => req.json());
    }

    public ProductTypeToPriceText(product: ElsaProduct): string {
        const text = [''];
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
