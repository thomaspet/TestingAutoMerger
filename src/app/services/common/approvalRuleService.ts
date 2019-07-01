import {Injectable} from '@angular/core';
import {ApprovalRule} from '@uni-entities';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UniHttp} from '@uni-framework/core/http/http';

@Injectable()
export class ApprovalRuleService extends BizHttp<ApprovalRule> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = ApprovalRule.RelativeUrl;
        this.defaultExpand = ['Steps.User'];
    }
}
