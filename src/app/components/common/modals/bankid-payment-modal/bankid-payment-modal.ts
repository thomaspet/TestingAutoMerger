import {Component, EventEmitter,} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {PaymentBatch} from '@uni-entities';
import {PaymentBatchService, ErrorService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';

import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    templateUrl: './bankid-payment-modal.html',
    styleUrls: ['./bankid-payment-modal.sass']
})
export class BankIDPaymentModal implements IUniModal {

    options: IModalOptions = {};
    onClose = new EventEmitter();

    busy: boolean = true;
    batchID: number;
    hashValue: string = '';
    message = 'Henter informasjon...';
    icon = '';
    failed = false;

    constructor(
        private errorService: ErrorService,
        private paymentBatchService: PaymentBatchService
    ) { }

    ngOnInit() {
        this.batchID = this.options.data?.batchID;
        this.hashValue = this.options.data?.hashValue;
        
        this.paymentBatchService.Get(this.batchID).subscribe((batch: PaymentBatch) => {
            if (batch.StatusCode <= 45002) {
                this.message = `Sender ${batch.NumberOfPayments} betaling til banken...` + (batch.NumberOfPayments > 100 ? ' Dette kan ta litt tid, vennligst vent.' : '');
                this.sendBatchToPayment();
            } else {
                this.close(false);
            }
        }, err => {
            this.close(false);
        });
    }

    sendBatchToPayment() {
        const body = {
            HashValue: this.hashValue
        };

        this.paymentBatchService.sendToPayment(this.batchID, body).subscribe(() => {
            this.message = 'Betaling sendt til bank..';
            this.busy = false;
            this.icon = 'check_circle_outline';
        }, err => {
            this.message = 'Betaling ble opprettet, men noe gikk galt da vi skulle sende fil til bank. Vennligst dobbelsjekk i nettbanken.';
            this.busy = false;
            this.icon = 'error_outline';
            this.failed = true;
        });
    }

    close(value) {
        this.onClose.emit(value);
    }
}
