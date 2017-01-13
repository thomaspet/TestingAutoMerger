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

    public registerReceiptFileCamt054(file: File): Observable<any> {
        return super.PutAction(null, 'register-receipt-file-camt054', `fileID=${file.ID}`);
    }

    public registerCustomerPaymentFile(file: File): Observable<any> {
        return super.PutAction(null, 'register-ocr-giro-file', `fileID=${file.ID}`);
    }

    public completeCustomerPayment(paymentBatchID: number) {
        return super.PutAction(null, 'complete-ocr-payment-registration', `ID=${paymentBatchID}`);
    }

    public getStatusText(statusCode: number, isCustomerPayment: boolean): string {
        let word = isCustomerPayment ? 'Innbetaling' : 'Kvittering';

        if (!statusCode) {
            return '';
        } else if (statusCode === 45001) {
            return 'Opprettet';
        } else if (statusCode === 45002) {
            return 'Opprettet betalingsfil';
        } else if (statusCode === 45003) {
            return 'Sendt til bank';
        } else if (statusCode === 45004) {
            return `${word} mottatt`;
        } else if (statusCode === 45005) {
            return `${word} innlest`;
        } else if (statusCode === 45006) {
            return 'Avvist fra bank';
        } else if (statusCode === 45007) {
            return `${word} er ufullstendig`;
        } else if (statusCode === 45008) {
            return 'Delvis fullført';
        } else if (statusCode === 45009) {
            return 'Fullført';
        }

        return 'Ukjent status: ' + statusCode;
    }
}
