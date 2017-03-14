import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../AppConfig';
import {Altinn} from '../../unientities';
import {BusinessRelationSearch} from '../../models/Integration/BusinessRelationSearch';

@Injectable()
export class IntegrationServerCaller {

    constructor(protected http: UniHttp) {}


    public checkSystemLogin(orgno: string, sysuser: string, syspw: string, lang: string): Observable<any> {
        return this.http.withNewHeaders().
        withHeaders( {'sysusername': sysuser,
            'syspassword': syspw,
            'lang': lang,
            'orgno': orgno}).
        asGET().
        send({
            baseUrl: AppConfig.BASE_URL_INTEGRATION,
            apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN,
            endPoint: '/testsystem'
        })
            .map(response => response.json());
    }

    public getAltinnCorrespondence(altinn: Altinn, orgno: string, receiptID: number): Observable<any> {
        var altinnLogin: {
            userID: string,
            password: string,
            pin: string,
            preferredLogin: string,
            timeStamp: string
        } = JSON.parse(localStorage.getItem('AltinnUserData'));
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
                baseUrl: AppConfig.BASE_URL_INTEGRATION,
                apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN,
                endPoint: 'receipt/' + receiptID + '/correspondence'
            })
            .map(response => response.json());
    }

    public businessRelationSearch(
        query: string,
        limit: number = 30,
        searchInBrreg: boolean = false
    ): Observable<[BusinessRelationSearch]> {
        return this.http
            .withBaseUrl(AppConfig.BASE_URL_INTEGRATION)
            .withDomain('api/businessrelationsearch')
            .withEndPoint(`?searchCriteria=${query}&limit=${limit}&datahotel=${searchInBrreg}`)
            .asGET()
            .send()
            .map(response => response.json());
    }

}
