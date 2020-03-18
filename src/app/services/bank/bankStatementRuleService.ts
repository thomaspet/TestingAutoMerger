import {Injectable} from '@angular/core';
import {UniHttp, BizHttp} from '@uni-framework/core/http';
import {BankStatementRule, BankStatementEntry} from '@uni-entities';

@Injectable()
export class BankStatementRuleService extends BizHttp<BankStatementRule> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BankStatementRule.RelativeUrl;
        this.entityType = BankStatementRule.EntityType;
        this.DefaultOrderBy = 'Priority';
    }

    runAll(bankStatementEntries: BankStatementEntry[]) {
        return super.ActionWithBody(null, bankStatementEntries , 'apply-rules', 'post');
    }

    run(ruleID: number, bankStatementEntries: BankStatementEntry[]) {
        return super.ActionWithBody(null, bankStatementEntries, 'apply-rule', 'post', `ID=${ruleID}`);
    }
}
