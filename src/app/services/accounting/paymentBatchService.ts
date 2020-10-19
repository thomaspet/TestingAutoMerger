import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {PaymentBatch, File} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';

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
        return super.PutAction(null, 'generate-payment-file', `ID=${paymentBatchID}&acceptjob=true`);
    }
    // OLD
    public registerReceiptFile(fileID: number): Observable<any> {
        return super.PutAction(null, 'register-receipt-file', `fileID=${fileID}`);
    }
    // OLD
    public registerCustomerPaymentFile(file: File): Observable<any> {
        return super.PutAction(null, 'register-customer-payment-file', `fileID=${file.ID}`);
    }
    // OLD
    public registerAndCompleteCustomerPayment(fileID: number) {
        return super.PutAction(null, 'register-and-complete-customer-payment', `fileID=${fileID}&acceptjob=true`);
    }

    // OLD
    public completeCustomerPayment(paymentBatchID: number) {
        return super.PutAction(null, 'complete-customer-payment-registration', `ID=${paymentBatchID}`);
    }

    public registerBankFile(fileID: number): Observable<any> {
        return this.http
        .asPOST()
        .usingRootDomain()
        .withEndPoint('bank/register-fileID?fileID=' + fileID)
        .send()
        .map(response => response.body);
    }

    public checkAutoBankAgreement() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('bank-agreements?expand=BankAccount.Bank')
            .send()
            .map(response => response.body);
    }

    public getStatusText(statusCode: number, isCustomerPayment: boolean): string {
        const word = isCustomerPayment ? 'Innbetaling' : 'Kvittering';

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
        } else if (statusCode === 45014) {
            return 'Kommunikasjonsfeil. Vennligst dobbelsjekk i nettbanken';
        }
        return 'Ukjent status: ' + statusCode;
    }

    public sendAllToPayment(model: any) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(model)
            .withEndPoint('paymentbatches?action=create-and-send-all-to-payment')
            .send()
            .map(response => response.body);
    }

    public sendToPayment(batchID: number, body): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint(this.relativeURL + '?action=send-batch-to-payment&batchID=' + batchID)
            .send()
            .map(response => response.body);
    }

    public sendAutobankPayment(body: any) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint('paymentbatches?action=create-and-send-to-payment')
            .send()
            .map(response => response.body);
    }

    public updatePaymentsToPaidAndJournalPayments(paymentIDs: number[]) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint('paymentbatches?action=update-payments-to-paid-and-journal-payments')
            .send()
            .map(response => response.body);
    }

    public updatePaymentsToPaid(paymentIDs: number[]) {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(paymentIDs)
            .withEndPoint('paymentbatches?action=update-payments-to-completed')
            .send()
            .map(response => response.body);
    }

    public sendPasswordToTwoFactor(body: any) {
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(body)
            .withEndPoint('bank-agreements?action=auth-code')
            .send()
            .map(response => response.body);
    }
}
