import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Inntekt} from '../../../unientities';

@Injectable()
export class InntektService extends BizHttp<Inntekt> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Inntekt.RelativeUrl;
        this.entityType = Inntekt.EntityType;
    }

    public getSalaryValidValue(type: string = '') {
        let url = this.relativeURL;
        if (url === '') {
            url = 'salaryvalidvalues';
        }
        if (type) {
            url = url + '?type=' + type; 
        }
        
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(url)
            .send()
            .map(response => response.json());
    }

    public getSalaryValidValueTypes() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('salaryvalidvalue/types')
            .send()
            .map(response => response.json());
    }
}
