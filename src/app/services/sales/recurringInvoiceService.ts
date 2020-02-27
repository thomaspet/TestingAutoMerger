import {Injectable} from '@angular/core';
import {RecurringInvoice, StatusCodeRecurringInvoice} from '@uni-entities';
import {ITickerActionOverride} from '../../services/common/uniTickerService';
import {UniHttp} from '@uni-framework/core/http/http';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {map, take} from 'rxjs/operators';

@Injectable()
export class RecurringInvoiceService extends BizHttp<RecurringInvoice> {
    actionOverrides: Array<ITickerActionOverride> = [];
    statusTypes: Array<any> = [
        { Code: StatusCodeRecurringInvoice.Active, Text: 'Aktiv' },
        { Code: StatusCodeRecurringInvoice.InActive, Text: 'Inaktiv' }
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = RecurringInvoice.RelativeUrl;
        this.entityType = RecurringInvoice.EntityType;
    }

    getInvoiceItems(invoiceID: number) {
        const expand = [
            'Product.VatType',
            'VatType',
            'Dimensions.Info',
            'Account',
        ].join(',');

        const filter = `RecurringInvoiceID eq ${invoiceID}`;
        const url = `recurringinvoiceitems?filter=${filter}&expand=${expand}`;

        const hash = this.hashFnv32a(url);
        let request = this.getFromCache(hash);

        if (!request) {
            request = this.http
                .usingBusinessDomain()
                .asGET()
                .withEndPoint(url)
                .send()
                .publishReplay(1)
                .refCount();

            this.storeInCache(hash, request);
        }

        return request.pipe(
            take(1),
            map(res => res.body)
        );
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
            .usingStatisticsDomain()
            .withEndPoint('?model=recurringinvoicelog&select=customerorder.ordernumber as OrderNumber' +
            ',customerinvoice.InvoiceNumber as InvoiceNumber,recurringinvoicelog.*&filter=recurringinvoiceid eq ' + id +
            '&join=recurringinvoicelog.invoiceid eq customerinvoice.id and recurringinvoicelog.orderid eq customerorder.id' +
            '&top=&orderby=id desc&wrap=false ')
            .send()
            .map(res => res.body);

    }
}
