import {Injectable, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {RequestMethod} from '@angular/http';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../../app/AppConfig';
import {Altinn} from '../../unientities';


@Injectable()
export class IntegrationServerCaller {    
    
    constructor(protected http: UniHttp) {
                
    }
    
    
    public checkSystemLogin(orgno: string, sysuser: string, syspw: string, lang: string): Observable<any> {
        return this.http.withNewHeaders().
        withHeaders( {'sysusername': sysuser,
            'syspassword': syspw,
            'lang': lang,
            'orgno': orgno}).
            asGET().
            send({baseUrl: AppConfig.BASE_URL_INTEGRATION, apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN, endPoint: '/testsystem'})
            .map(response => response.json());
    }
    
    public getAltinnCorrespondence(altinn: Altinn, orgno: string, receiptID: number) {
        var altinnLogin: {username: string, password: string, pin: string, preferredLogin: string, timeStamp: string} = JSON.parse(localStorage.getItem('AltinnUserData'));
        return this.http
                   .withNewHeaders()
                   .withHeaders({
                       'sysusername': altinn.SystemID,
                       'syspassword': altinn.SystemPw,
                       'lang': altinn.Language,
                       'orgno': orgno,
                       'userID': altinnLogin.username,
                       'userPass': altinnLogin.password,
                       'authmethod': altinnLogin.preferredLogin,
                       'pin': altinnLogin.pin
                   })
                   .asGET()
                   .send({baseUrl: AppConfig.BASE_URL_INTEGRATION, apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN, endPoint: 'receipt/' + receiptID + '/correspondence'})
                   .map(response => response.json());
    }
    
}
