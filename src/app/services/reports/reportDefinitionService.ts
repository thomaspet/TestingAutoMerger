import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReportDefinition} from '../../unientities';
import {Observable} from 'rxjs';

export enum ReportNames {
    PAYCHECK_FROM_TO = 'Lønnslipp',
    PAYCHECK_EMP_FILTER = 'Lønnslipp_emp_filter',
    ANNUAL_STATEMENT = 'Årsoppgave',
    BARNEPASS = 'Barnepass'
}

@Injectable()
export class ReportDefinitionService extends BizHttp<ReportDefinition> {

    constructor(private uniHttp: UniHttp) {
        super(uniHttp);
        this.relativeURL = ReportDefinition.RelativeUrl;
        this.entityType = ReportDefinition.EntityType;
        this.DefaultOrderBy = 'Category';
    }

    public getReportByName(name: string): Observable<any> {
        return this.GetAll(`filter=Name eq '${name}'`).map((reports) => {
            return reports[0];
        });
    }

    public getReportByID(id: number): Observable<any> {
        return this.GetAll(`filter=ID eq '${id}'`).map((reports) => {
            return reports[0];
        });
    }
}
