import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaProduct} from '@app/models';

@Injectable()
export class ElsaProductService {
    private cache: {[endpoint: string]: Observable<HttpResponse<any>>} = {};

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

        return request.map(res => res.body);
    }

    public Get(id: number): Observable<ElsaProduct> {
        return this.requestData(`/api/products/${id}`);
    }

    public GetAll(filter?: string): Observable<ElsaProduct[]> {
        const url = '/api/products' + (filter ? ('?$filter=' + filter) : '');
        return this.requestData(url);
    }

    public FindProductByName(name: string): Observable<ElsaProduct> {
        return this.requestData('/api/products').map(products => {
            return products.find(product => product.name === name);
        });
    }

    public ProductTypeToPriceText(product: ElsaProduct): string {
        const text = [''];
        if (product.IsPerUser) {
            text.push('per bruker');
        }
        if (product.IsMonthly) {
            text.push('per måned');
        }
        if (product.IsPerTransaction) {
            text.push('per transaksjon');
        }
        return text.join(' / ');
    }
}
