import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PaymentService } from '@app/services/services';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'preapproved-payments-modal',
    templateUrl: './preapproved-payments-modal.html',
    styleUrls: ['./preapproved-payments-modal.sass']
})

export class PreapprovedPaymentsModal implements OnInit, IUniModal {

    @Input() options: IModalOptions;
    @Output() onClose: EventEmitter<any> = new EventEmitter();

    paymentIDs = [];
    hash: string;
    hashFromAllPayments: string;
    isAll: boolean = false;
    busy = false;

    constructor (private paymentService: PaymentService) {}

    ngOnInit() {
        this.paymentIDs = this.options.data.paymentIDs;
        this.hash = this.options.data.hash;
        this.hashFromAllPayments = this.options.data.hashFromAllPayments;
        this.isAll = this.options.data.isAll;

        if (this.isAll && (!this.options.data.filter || !this.options.data.expand)) {
            this.close(false);
        }
    }

    sendPayments() {
        this.busy = true;
        const test = this.getParamsStringForAll();
        const obs = this.isAll 
        ? this.paymentService.createPaymentBatchForAll(false, this.getParamsStringForAll()) 
        : this.paymentService.createPaymentBatchWithHash(this.paymentIDs, this.hash, window.location.href);

        const afterBatchCreated = (paymentBatch) => {
            const startSign = window.location.href.indexOf('?') >= 0 ? '&' : '?';
            const redirecturl = window.location.href + `${startSign}hashValue=${paymentBatch.HashValue}&batchID=${paymentBatch.ID}`;

            let bankIDURL = environment.authority + `/bankid?clientid=${environment.client_id}&securityHash=${paymentBatch.HashValue}&redirecturl=${encodeURIComponent(redirecturl)}`
            window.location.href = bankIDURL;
            this.busy = false;
        }

        // Send that batch to the bank directly
        obs.subscribe((result: any) => {
            
            if (result?.ProgressUrl) {
                this.paymentService.waitUntilJobCompleted(result.ID).subscribe(batchJobResponse => {
                    if (batchJobResponse && !batchJobResponse.HasError && batchJobResponse.Result && batchJobResponse.Result.ID > 0) {
                        afterBatchCreated(batchJobResponse);
                    } else {
                        this.busy = false;
                    }
                }, err => {
                    this.busy = false;
                });
            } else {
                afterBatchCreated(result);
            }

        }, err => {
            this.busy = false;
            // Something went wrong creating the batch.. Close?
        });
    }

    getParamsStringForAll(): string {
        return `&hash=${this.hashFromAllPayments}&filter=${this.options.data.filter}&expand=${this.options.data.expand}&createfile=true`;
    }

    close(value = false) {
        this.onClose.emit(value);
    }

}