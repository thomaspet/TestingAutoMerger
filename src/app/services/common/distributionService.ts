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

    public getEntityTypes() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/distributions?action=get-entitytype-list')
            .send()
            .map(res => res.json());
        }

        public getLegalElementTypes() {
            return this.http
                .asGET()
                .usingBusinessDomain()
                .withEndPoint('/distributions?action=get-legal-elementtypes')
                .send()
                .map(res => res.json());
            }

        public saveDistributionPlan(plan) {
            if (!plan.ID) {
                return this.http
                .asPOST()
                .usingBusinessDomain()
                .withBody(plan)
                .withEndPoint('distributions')
                .send()
                .map(res => res.json());
            } else {
                return this.http
                .asPUT()
                .usingBusinessDomain()
                .withBody(plan)
                .withEndPoint('distributions/' + plan.ID)
                .send()
                .map(res => res.json());
            }
        }
}
