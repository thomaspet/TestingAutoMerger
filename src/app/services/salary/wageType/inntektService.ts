import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {code} from '../../../unientities';
import {Observable} from 'rxjs';

@Injectable()
export class InntektService extends BizHttp<code> {

    constructor(http: UniHttp) {
        super(http);
    }

    public getSalaryValidValue(type: string = ''): Observable<code[]> {
        type = type.trim();
        let url = `salaryvalidvalues?action=getall`;

        if (type) {
            url = url + `&type=${type}`;
        }

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(url)
            .send()
            .map(response => response.json());
    }

    public getSalaryValidValueTypes(): Observable<string> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`salaryvalidvalue/types?action=getall`)
            .send()
            .map(response => response.json());
    }
}
