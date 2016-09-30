import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {CompanyVacationRate} from '../../../unientities';

export class CompanyVacationRateService extends BizHttp<CompanyVacationRate> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanyVacationRate.RelativeUrl;
        this.entityType = CompanyVacationRate.EntityType;
    }
}
