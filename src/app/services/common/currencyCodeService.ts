import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {CurrencyCode} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { Observable } from 'rxjs';

@Injectable()
export class CurrencyCodeService extends BizHttp<CurrencyCode> {

    cache: number;

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = CurrencyCode.RelativeUrl;
        this.entityType = CurrencyCode.EntityType;
        this.DefaultOrderBy = null;
        this.cache = JSON.parse(localStorage.getItem('currencyCache'));
    }

    public GetAll(query?: string, expand?: string[]): Observable<any> {
        if (this.DefaultOrderBy && (!query || (query && query.toLowerCase().indexOf('orderby=') < 0))) {
            if (query) {
                query += '&orderby=' + this.DefaultOrderBy;
            } else {
                query = 'orderby=' + this.DefaultOrderBy;
            }
        }

        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }

        this.cache = this.cache || this.hashFnv32a(this.relativeURL + query + expandStr);
        let request = this.getFromCache(this.cache);

        if (!request) {
            request = this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(this.relativeURL + (query ? '?' + query : ''))
                .send({expand: expandStr})
                .publishReplay(1)
                .refCount();

            this.storeInCache(this.cache, request);

            localStorage.setItem('currencyCache', this.cache.toString());
        }

        return request.map(res => res.body);
    }
}

