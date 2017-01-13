import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntryLine} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';
import {TransqueryDetailsCalculationsSummary} from '../../models/accounting/TransqueryDetailsCalculationsSummary'
import {PeriodDates} from '../../models/accounting/PeriodDates';

declare const moment: any;

@Injectable()
export class JournalEntryLineService extends BizHttp<JournalEntryLine> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = JournalEntryLine.RelativeUrl;

        this.entityType = JournalEntryLine.EntityType;

        // set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;
    }

    public periodNumberToPeriodDates(period: number, year: number): PeriodDates {
        const format = 'YYYY-MM-DD';
        const periodDates = new PeriodDates();
        const firstDay = moment([year, period - 1, 1]);
        periodDates.firstDayOfPeriod = firstDay.format(format);
        periodDates.lastDayOfPeriod = firstDay.endOf('month').format(format);
        return periodDates;
    }


    public getJournalEntryLinePostPostData(includeOpenPosts, includeMarkedPosts, customerID, supplierID) {
        let querystring: string = `&includeOpenPosts=${includeOpenPosts}&includeMarkedPosts=${includeMarkedPosts}`;

        if (customerID) {
            querystring += '&customerID=' + customerID;
        }

        if (supplierID) {
            querystring += '&supplierID=' + supplierID;
        }

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-journal-entry-postpost-data' + querystring)
            .send()
            .map(response => response.json());
    }

    public StatusTypes: Array<any> = [
        { Code: '31001', Text: 'Åpen' },
        { Code: '31002', Text: 'Delmerket' },
        { Code: '31003', Text: 'Merket' },
        { Code: '31004', Text: 'Kreditert'}
    ];

    public getStatusText = (statusCode: number) => {
        var text = '';
        this.StatusTypes.forEach((status) => {
            if (status.Code == statusCode) {
                text = status.Text;
                return;
            }
        });
        return text;
    };
}
