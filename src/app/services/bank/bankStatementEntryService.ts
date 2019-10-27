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

    getEntriesWithOpenHistory(accountID: number, fromDate?: Date, toDate?: Date): Observable<BankStatementEntry[]> {

        if ( (!fromDate) || (!toDate) ) { return; }

        const sFrom = moment(fromDate).format('YYYY-MM-DD');
        const sTo =  moment(toDate).format('YYYY-MM-DD');
        const startYear = new Date(fromDate.getFullYear(), 0, 1);
        const sStartYear = moment(startYear).format('YYYY-MM-DD');

        const query = `/statistics?model=bankstatemententry&select=bankstatemententry.*`
            + `&filter=bankstatement.accountid eq ${accountID}`
            + ` and ( ( isnull(statuscode,0) lt 48002 and bookingdate ge '${sStartYear}' )`
            + `  or bookingdate ge '${sFrom}' )`
            + ` and bookingdate le '${sTo}'&join=&expand=bankstatement&wrap=false`;

        return this.http
            .usingRootDomain()
            .asGET()
            .withEndPoint(query)
            .send()
            .map( x => x.body );

    }

}
