import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaPurchase} from '@app/models';

@Injectable()
export class ElsaPurchaseService {
    private cache: {[endpoint: string]: Observable<Response>} = {};

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
        let endpoint = 'api/purchases';
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

        return cachedRequest.map(res => res.json());
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
            .withEndPoint('api/purchases')
            .withBody(updates)
            .send()
            .map(res => res.status === 200);
    }
}
