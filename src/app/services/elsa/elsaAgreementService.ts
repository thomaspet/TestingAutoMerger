import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {UniHttp} from '@uni-framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaAgreement} from '@app/models';
import {map} from 'rxjs/operators';
import {AuthService} from '@app/authService';
import {environment} from 'src/environments/environment';

@Injectable()
export class ElsaAgreementService {
    private cache: {[endpoint: string]: Observable<HttpResponse<any>>} = {};
    ELSA_SERVER_URL = environment.ELSA_SERVER_URL;

    constructor(
        private authService: AuthService,
        private uniHttp: UniHttp,
        private http: HttpClient
    ) {
        this.authService.authentication$.subscribe(() => this.cache = {});
    }

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

    // this should, in theory, only be used once per (brand new) user, no need to cache it
    getUserLicenseAgreement(): Observable<ElsaAgreement> {
        const endpoint = `/api/agreements?$filter=agreementtype eq 'UserLicenseGdpr' and agreementstatus eq 'Active'`;
        return this.http.get<ElsaAgreement>(this.ELSA_SERVER_URL + endpoint)
            .pipe(map(agreements => agreements[0]));
    }

    getContractAgreement(): Observable<ElsaAgreement> {
        const endpoint = `/api/agreements?$filter=agreementtype eq 'Contract' and agreementstatus eq 'Active'`;
        return this.requestData(endpoint)
            .pipe(map(agreements => agreements[0]));
    }

}
