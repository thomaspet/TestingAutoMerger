import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaAgreement} from '@app/models';
import {map} from 'rxjs/operators';

@Injectable()
export class ElsaAgreementService {
    private cache: {[endpoint: string]: Observable<HttpResponse<any>>} = {};

    constructor(private uniHttp: UniHttp) {}

    private requestData(endpoint: string): Observable<ElsaAgreement[]> {
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

    GetByProductID(productID: number): Observable<ElsaAgreement> {
        return this.requestData(`/api/agreements?$filter=productid eq ${productID} and agreementstatus eq 'Active'`)
            .pipe(map(agreements => agreements[0]));
    }

}
