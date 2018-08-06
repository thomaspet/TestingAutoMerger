import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Company} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CompanyService extends BizHttp<Company> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = Company.RelativeUrl;
        this.entityType = Company.EntityType;
        this.DefaultOrderBy = null;
    }

    public updateCompanyClientNumber(companyID: number, clientNumber: number, key) {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`companies/${companyID}?action=clientnumber&clientnumber=${clientNumber}`)
            .withHeader('CompanyKey', key)
            .send({}, null, false)
            .map(res => res.json());
    }
}
