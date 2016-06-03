import {Injectable, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http'
import {RequestMethod} from "@angular/http";
import {UniHttp} from "../../../framework/core/http/http";
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../../app/AppConfig';


@Injectable()
export class IntegrationServerCaller {    
    
    constructor(protected http : UniHttp) {
                
    }
    
    
    public checkSystemLogin(orgno: string, sysuser:string, syspw:string, lang:string) : Observable<any> {
        return this.http.withNewHeaders().
        withHeaders( {'sysusername': sysuser,
            'syspassword': syspw,
            'lang': lang,
            'orgno': orgno}).
            asGET().
            send({baseUrl: AppConfig.BASE_URL_INTEGRATION, apiDomain: AppConfig.INTEGRATION_DOMAINS.ALTINN, endPoint: '/testsystem'});
    }
    
    
}