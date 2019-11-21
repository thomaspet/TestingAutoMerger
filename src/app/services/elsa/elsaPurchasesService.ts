import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaPurchase} from '@app/models';
import {cloneDeep} from 'lodash';

@Injectable()
export class ElsaPurchaseService {
    private cache: {[endpoint: string]: Observable<HttpResponse<any>>} = {};

    constructor(private uniHttp: UniHttp) {
        this.uniHttp.authService.authentication$.subscribe(() => {
            this.invalidateCache();
        });
    }

    invalidateCache() {
        this.cache = {};
    }

    getPurchaseByProductName(productName: string): Observable<ElsaPurchase> {
        return this.getAll(`ProductName=${productName}`).map(res => {
            return (res && res[0]) || null;
        });
    }

    getAll(filter?: string, companyKeyOverride?: string): Observable<ElsaPurchase[]> {
        let endpoint = 'api/elsa/purchases';
        if (filter) {
            endpoint += '?' + filter;
        }

        const cacheKey = endpoint + (companyKeyOverride || '');
        let cachedRequest = this.cache[cacheKey];

        if (!cachedRequest) {
            if (companyKeyOverride) {
                this.uniHttp.withHeader('CompanyKey', companyKeyOverride);
            } else {
                this.uniHttp.withDefaultHeaders();
            }

            cachedRequest = this.uniHttp
                .asGET()
                .usingEmptyDomain()
                .withEndPoint(endpoint)
                .send()
                .publishReplay(1)
                .refCount();

            this.cache[cacheKey] = cachedRequest;
        }

        return cachedRequest.map(res => cloneDeep(res.body));
    }

    massUpdate(updates: ElsaPurchase[], companyKeyOverride?: string) {
        this.invalidateCache();

        if (companyKeyOverride) {
            this.uniHttp.withHeader('CompanyKey', companyKeyOverride);
        } else {
            this.uniHttp.withDefaultHeaders();
        }

        return this.uniHttp
            .asPUT()
            .usingEmptyDomain()
            .withEndPoint('api/elsa/purchases')
            .withBody(updates)
            .send()
            .map(res => res.status === 200);
    }

    cancelPurchase(productId: number) {
        return this.uniHttp
            .asDELETE()
            .usingEmptyDomain()
            .withEndPoint(`api/elsa/cancelpurchase/${productId}`)
            .send()
            .map(res => res.status === 200);
    }
}
