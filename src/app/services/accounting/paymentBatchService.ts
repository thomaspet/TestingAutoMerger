import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentBatch, File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PaymentBatchService extends BizHttp<PaymentBatch> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = PaymentBatch.RelativeUrl;
        this.entityType = PaymentBatch.EntityType;
        this.DefaultOrderBy = null;
    }

    public revertPaymentBatch(paymentBatchID: number, recreatePayments: Boolean = false): Observable<any> {
        return super.PutAction(null, 'revert-payment-batch', `ID=${paymentBatchID}&recreatePayments=${recreatePayments}`);
    }

    public generatePaymentFile(paymentBatchID: number): Observable<PaymentBatch> {
        return super.PutAction(null, 'generate-payment-file', `ID=${paymentBatchID}`);
    }

    public registerReceiptFileCamt054(file: File): Observable<any> {
        return super.PutAction(null, 'register-receipt-file-camt054', `fileID=${file.ID}`);
    }
    // OLD
    public registerCustomerPaymentFile(file: File): Observable<any> {
        return super.PutAction(null, 'register-customer-payment-file', `fileID=${file.ID}`);
    }

    public registerAndCompleteCustomerPayment(fileID: number) {
        return super.PutAction(null, 'register-and-complete-customer-payment', `fileID=${fileID}&acceptjob=true`);
    }

    // OLD
    public completeCustomerPayment(paymentBatchID: number) {
        return super.PutAction(null, 'complete-customer-payment-registration', `ID=${paymentBatchID}`);
    }

    public checkAutoBankAgreement() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/bank-agreements')
            .send()
            .map(response => response.json());
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
        } else if (statusCode === 45010) {
            return 'Transit til bank';
        }

        return 'Ukjent status: ' + statusCode;
    }

    public SendToPayment(password: string, paymentBatchID: number): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(password)
            .withEndPoint(this.relativeURL + '?action=send-to-payment&fileId=' + paymentBatchID)
            .send()
            .map(response => response.json());
    }

    public sendAutobankPayment(body: any) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint('paymentbatches?action=create-and-send-to-payment')
            .send()
            .map(response => response.json());
    }

    public updatePaymentsToPaidAndJournalPayments(paymentIDs: number[]) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint('paymentbatches?action=update-payments-to-paid-and-journal-payments')
            .send()
            .map(response => response.json());
    }

    public updatePaymentsToPaid(paymentIDs: number[]) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint('paymentbatches?action=update-payments-to-completed')
            .send()
            .map(response => response.json());
    }

    public sendPasswordToTwoFactor(body: any) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint('bank-agreements?action=auth-code')
            .send()
            .map(response => response.json());
    }
}
