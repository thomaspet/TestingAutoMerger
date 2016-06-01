import {Injectable, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http'
import {RequestMethod} from "@angular/http";
import {UniHttp} from "../../../framework/core/http/http";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/concatMap";
import {AppConfig} from '../../../app/AppConfig';

@Injectable()
export class IntegrationServerCaller 
{    
    private intHttp;
 
    constructor(protected http: UniHttp) {
            let intHttp = http;
    }
    
    
    public checkSystemLogin(orgno: string, sysuser:string, syspw:string, lang:number){
        
        var activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        console.log(JSON.stringify(activeCompany));
                
        // return this.intHttp.withHeader('sysusername', sysuser).
        // withHeader('syspassword', syspw).
        // withHeader('lang', lang).
        // withHeader('orgno', orgno).
        // asGET().
        // send({baseurl: AppConfig.BASE_URL_INTEGRATION, apiDomain: AppConfig.INTEGRATION_DOMAINS, endPoint: '/testsystem'});                
    }
    
    
}