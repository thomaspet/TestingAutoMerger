import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentBatch, File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class PaymentBatchService extends BizHttp<PaymentBatch> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PaymentBatch.RelativeUrl;
        this.entityType = PaymentBatch.EntityType;
        this.DefaultOrderBy = null;
    }

    public revertPaymentBatch(paymentBatchID: number): Observable<any> {
        return super.PutAction(null, 'revert-payment-batch', `ID=${paymentBatchID}`);
    }

    public generatePaymentFile(paymentBatchID: number): Observable<PaymentBatch> {
        return super.PutAction(null, 'generate-payment-file', `ID=${paymentBatchID}`);
    }

    public parseReceiptFile(file: File): Observable<PaymentBatch> {
        return super.PostAction(null, 'parse-receipt-file', `fileid=${file.ID}`);
    }

    public getStatusText(statusCode: number): string {
        if (!statusCode) {
            return '';
        } else if (statusCode === 45001) {
            return 'Opprettet';
        } else if (statusCode === 45002) {
            return 'Opprettet betalingsfil';
        } else if (statusCode === 45003) {
            return 'Sendt til bank';
        } else if (statusCode === 45004) {
            return 'Kvittering mottatt';
        } else if (statusCode === 45005) {
            return 'Kvittering innlest';
        } else if (statusCode === 45006) {
            return 'Avvist fra bank';
        }

        return 'Ukjent status: ' + statusCode;
    }
}
