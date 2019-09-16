import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {BankStatementEntry} from '@uni-entities';
import * as moment from 'moment';
import {Observable} from 'rxjs';

@Injectable()
export class BankStatementEntryService extends BizHttp<BankStatementEntry> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = BankStatementEntry.RelativeUrl;
        this.entityType = BankStatementEntry.EntityType;
        this.DefaultOrderBy = null;
    }

    getEntries(accountID: number, fromDate?: Date, toDate?: Date): Observable<BankStatementEntry[]> {
        let params = `accountid=${accountID}`;
        if (fromDate) {
            params += `&fromdate=${moment(fromDate).format('YYYY-MM-DD')}`;
        }

        if (toDate) {
            params += `&todate=${moment(toDate).format('YYYY-MM-DD')}`;
        }

        return this.GetAction(null, 'entries-for-account', params);
    }
}
