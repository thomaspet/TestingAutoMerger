import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition} from '../../unientities';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ReportDefinitionService extends BizHttp<ReportDefinition>{
    private baseHttp: Http;

    constructor(
        private uniHttp: UniHttp,

    ) {
        super(uniHttp);
        this.baseHttp = this.uniHttp.http;
        this.relativeURL = ReportDefinition.RelativeUrl;
        this.entityType = ReportDefinition.EntityType;
        this.DefaultOrderBy = 'Category';
    }

    public getReportByName(name: string): Observable<any> {
        return this.GetAll(`filter=Name eq '${name}'`).map((reports) => {
            return reports[0];
        });
    }
}
