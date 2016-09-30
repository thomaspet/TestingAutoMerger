import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {CompanySalary} from '../../../unientities';

export class CompanySalaryService extends BizHttp<CompanySalary> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = CompanySalary.RelativeUrl;
        this.entityType = CompanySalary.EntityType;
    }

    public getCompanySalary() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL)
            .send({top: 1})
            .map(response => response.json());
    }
}
