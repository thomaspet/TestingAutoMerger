import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {DistributionPlan} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class DistributionPlanService extends BizHttp<DistributionPlan> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = DistributionPlan.RelativeUrl;
        this.entityType = DistributionPlan.EntityType;
        this.DefaultOrderBy = null;
    }

    public getElementTypes() {
        return this.http
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint('?model=DistributionPlanElementType&select=ID as ID,Name as Name,StatusCode as StausCode&wrap=false')
            .send()
            .map(res => res.json());
    }

    public saveDistributionPlan(plan) {
        if (!plan.ID) {
            return super.Post(plan);
        } else {
            return super.Put(plan.ID, plan);
        }
    }
}
