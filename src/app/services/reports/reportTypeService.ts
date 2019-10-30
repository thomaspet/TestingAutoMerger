import { Injectable } from '@angular/core';
import { BizHttp } from '../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../framework/core/http/http';
import { Observable } from 'rxjs';
import { ReportDefinition } from '../../unientities';
import { ReportTypeEnum } from '@app/models/reportTypeEnum';

@Injectable()
export class ReportTypeService extends BizHttp<string> {
    constructor(
        http: UniHttp,
    ) {
        super(http);

        this.relativeURL = 'report';
        this.entityType = null;
        this.DefaultOrderBy = null;
    }

    public getFormType(type: ReportTypeEnum, withdraft: boolean = false): Observable<ReportDefinition[]> {
        return this.http.asGET()
            .usingRootDomain()
            .withEndPoint(!withdraft
                ? `${this.relativeURL}/type/${type}`
                : `${this.relativeURL}/type-with-draft/${type}`
            )
            .send()
            .map(response => response.body);
    }
}
