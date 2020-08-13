import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BizHttp, UniHttp } from '@uni-framework/core/http';
import { code } from '@uni-entities';

@Injectable()
export class IncomeService extends BizHttp<code> {

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
            .map(response => response.body);
    }

    public getSalaryValidValueTypes(): Observable<string> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`salaryvalidvalue/types?action=getall`)
            .send()
            .map(response => response.body);
    }
}
