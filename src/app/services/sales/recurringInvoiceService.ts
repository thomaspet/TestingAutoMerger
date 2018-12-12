import { Injectable } from '@angular/core';
import { UniHttp } from '../../../framework/core/http/http';
import { RecurringInvoice, StatusCodeRecurringInvoice } from '../../unientities';
import { ITickerActionOverride } from '../../services/common/uniTickerService';
import { BizHttp } from '../../../framework/core/http/BizHttp';

@Injectable()
export class RecurringInvoiceService extends BizHttp<RecurringInvoice> {

    public actionOverrides: Array<ITickerActionOverride> = [];

    public statusTypes: Array<any> = [
        { Code: StatusCodeRecurringInvoice.Active, Text: 'Aktiv' },
        { Code: StatusCodeRecurringInvoice.InActive, Text: 'Inaktiv' }
    ];

    constructor( http: UniHttp ) {
        super(http);
        this.relativeURL = RecurringInvoice.RelativeUrl;
        this.entityType = RecurringInvoice.EntityType;
    }

    public getStatusText = (statusCode: string) => {
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public transitionAction(id: number, action: string) {
        return super.PostAction(id, action);
    }

    public getLog(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(`recurringinvoicelogs?filter=RecurringInvoiceID eq ${id}&orderby=InvoiceID DESC`)
            .send()
            .map(res => res.json());
    }
}
