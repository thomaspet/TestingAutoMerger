import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {code} from '../../../unientities';

@Injectable()
export class InntektService extends BizHttp<code> {

    constructor(http: UniHttp) {
        super(http);
    }

    public getSalaryValidValue(type: string = '') {
        let url = 'salaryvalidvalues';
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
