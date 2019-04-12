import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {ReInvoice, SupplierInvoice, StatusCodeReInvoice} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { isNullOrUndefined } from 'util';

@Injectable()
export class ReInvoicingService extends BizHttp<ReInvoice> {

    public statusTypes: Array<any> = [
        { Code: StatusCodeReInvoice.Marked, Text: 'Markert til viderefakturering', isPrimary: true},
        { Code: StatusCodeReInvoice.Ready, Text: 'Klar til viderefakturering', isPrimary: false },
        { Code: StatusCodeReInvoice.ReInvoiced, Text: 'Viderefakturert', isPrimary: false}
    ];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = ReInvoice.RelativeUrl;
        this.entityType = ReInvoice.EntityType;
    }

    public getStatusText(statusCode: number): string {
        if (isNullOrUndefined(statusCode)) {
            return '';
        }
        const statusType = this.statusTypes.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : 'Udefinert';
    }


}
