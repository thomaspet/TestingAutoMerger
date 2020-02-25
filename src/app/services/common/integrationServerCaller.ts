import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Altinn} from '../../unientities';
import {BusinessRelationSearch} from '../../models/Integration/BusinessRelationSearch';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class IntegrationServerCaller {

    constructor(
        protected http: UniHttp,
        private httpClient: HttpClient,
        private browserStorage: BrowserStorageService,
    ) {}

    public checkSystemLogin(orgno: string, sysuser: string, syspw: string, lang: string): Observable<any> {
        return this.http.withNewHeaders()
            .withHeaders({
                'sysusername': sysuser,
                'syspassword': syspw,
                'lang': lang,
                'orgno': orgno
            })
            .asGET()
            .send({
                baseUrl: environment.BASE_URL_INTEGRATION,
                apiDomain: environment.INTEGRATION_DOMAINS.ALTINN,
                endPoint: '/testsystem'
            })
            .map(response => response.body);
    }

    public getAltinnCorrespondence(altinn: Altinn, orgno: string, receiptID: number): Observable<any> {
        const altinnLogin: {
            userID: string,
            password: string,
            pin: string,
            preferredLogin: string,
            timeStamp: string
        } = this.browserStorage.getItem('AltinnUserData');
        return this.http
            .withNewHeaders()
            .withHeaders({
                'sysusername': altinn.SystemID,
                'syspassword': altinn.SystemPw,
                'lang': altinn.Language,
                'orgno': orgno,
                'userID': altinnLogin.userID,
                'userPass': altinnLogin.password,
                'authmethod': altinnLogin.preferredLogin,
                'pin': altinnLogin.pin
            })
            .asGET()
            .send({
                baseUrl: environment.BASE_URL_INTEGRATION,
                apiDomain: environment.INTEGRATION_DOMAINS.ALTINN,
                endPoint: 'receipt/' + receiptID + '/correspondence'
            })
            .map(response => response.body);
    }

    public businessRelationSearch(
        query: string,
        limit: number = 30,
        searchCompanies: boolean = true,
        searchPersons: boolean = true,
    ): Observable<BusinessRelationSearch[]> {
        if (!query) {
            return Observable.of([]);
        }

        return this.http
            .withBaseUrl(environment.BASE_URL_INTEGRATION)
            .withDomain('api/businessrelationsearch')
            .withEndPoint(
                `?searchCriteria=${query}` +
                `&limit=${limit}` +
                `&searchCompanies=${searchCompanies}` +
                `&searchPersons=${searchPersons}`
            )
            .asGET()
            .send()
            .map(response => response.body);
    }

    public getTravelTextPurchases(): Observable<any[]> {
        return this.httpClient.get<any[]>(environment.BASE_URL_INTEGRATION + 'api/traveltext/persons');
    }

    public purchaseTravelText(payload: any) {
        return this.httpClient.post(environment.BASE_URL_INTEGRATION + 'api/traveltext/register', payload);
    }

    public inviteUsersTravelText(payload: any) {
        return this.httpClient.put(environment.BASE_URL_INTEGRATION + 'api/traveltext/persons', payload);
    }
}
