import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ReportDefinition} from '../../unientities';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';
import {theme, THEMES} from 'src/themes/theme';

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
        // this must be removed when all reports work properly
        if (theme.theme === THEMES.EXT02 && type === ReportTypeEnum.INVOICE) {
            return this.http.asGET()
                .usingRootDomain()
                .withEndPoint(
                    `/biz/report-definitions?filter=contains(name,'Faktura ID') and ` +
                    `category eq 'Sales.Invoice' and isStandard eq 1 and reportType eq 1`
                ).send()
                .map(response => response.body);
        }
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
