import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {CompanyVacationRate} from '../../../unientities';
import {Observable} from 'rxjs';

@Injectable()
export class CompanyVacationRateService extends BizHttp<CompanyVacationRate> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanyVacationRate.RelativeUrl;
        this.entityType = CompanyVacationRate.EntityType;
    }

    public getCurrentRates(year: number = null): Observable<CompanyVacationRate> {
        return super.GetAction(null, 'current', year ? `year=${year}` : '');
    }
}
