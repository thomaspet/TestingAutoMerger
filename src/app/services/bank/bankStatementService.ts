import {Injectable} from '@angular/core';
import {BizHttp, UniHttp, RequestMethod} from '@uni-framework/core/http';
import {BankStatement, BankStatementMatch} from '@uni-entities';
import * as moment from 'moment';

@Injectable()
export class BankStatementService extends BizHttp<BankStatement> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BankStatement.RelativeUrl;
        this.entityType = BankStatement.EntityType;
        this.DefaultOrderBy = null;
    }

    matchItems(matches: BankStatementMatch[]) {
        return this.ActionWithBody(null, matches, 'match-items', RequestMethod.Post);
    }

    suggestMatch(req: { JournalEntries: any[], BankEntries: any[], Settings: { MaxDayOffset: number, MaxDelta: number } }) {
        return this.ActionWithBody(null, req, 'suggest-match', RequestMethod.Post);
    }

    getAccountStatus(accountID: number, fromDate?: Date, toDate?: Date, monthly?: boolean) {
        const action = monthly ? 'account-status-monthly' : 'account-status';
        let params = 'accountid=' + accountID;
        if (fromDate) {
            params += `&fromdate=${moment(fromDate).format('YYYY-MM-DD')}`;
        }

        if (toDate) {
            params += `&todate=${moment(toDate).format('YYYY-MM-DD')}`;
        }

        return this.GetAction(null, action, params);
    }

    getAccountBalance(accountID: number, date?: Date) {
        let params = `accountid=${accountID}`;
        if (date) {
            params += `&date=${moment(date).format('YYYY-MM-DD')}`;
        }

        return this.GetAction(null, 'account-balance', params);
    }

    getImportTemplates() {
        return this.GetAction(null, 'templates');
    }

    previewImport(template: any, accountID: number, fileID: number, maxLines: number = 35) {
        let params = `accountid=${accountID}&fileID=${fileID}`;
        if (maxLines) {
            params += `&maxLines=${maxLines}`;
        }

        return this.ActionWithBody(null, template, 'preview', 'post', params);
    }

    import(template: any, accountID: number, fileID: number, maxLines?: number) {
        let params = `accountid=${accountID}&fileID=${fileID}`;
        if (maxLines) {
            params += `&maxLines=${maxLines}`;
        }

        return this.ActionWithBody(null, template, 'import', 'post', params);
    }
}
