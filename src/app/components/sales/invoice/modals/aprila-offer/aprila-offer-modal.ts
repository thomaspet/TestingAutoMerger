import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { CustomerInvoiceService, ErrorService } from '@app/services/services';

@Component({
    selector: 'aprila-offer-modal',
    templateUrl: './aprila-offer-modal.html',
    styleUrls: ['./aprila-offer-modal.sass']
})
export class AprilaOfferModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    showOfferSettings: boolean = false;
    isShowOffer: boolean;
    hasPermission: boolean = false;

    isOffered = false;
    offer;
    isOfferAccept = false;
    headerTitle = '';
    validationError = [];
    gettingOfferProgress = false;
    offerFeedbackProgress = false;
    isError = false;
    offerLimitMessage = '';

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        if (this.options.data.invoiceId) {
            this.headerTitle = `Faktura utbetalingstilbud`;
            this.getOffer();
        }
    }

    close(accpeted) {
        this.onClose.emit(accpeted);
    }

    toggleShowSetting() {
        this.showOfferSettings = !this.showOfferSettings;
    }

    getOffer() {
        this.gettingOfferProgress = true;
        this.customerInvoiceService.getAprilaOffer(this.options.data.invoiceId).subscribe(
            res => {
                this.gettingOfferProgress = false;
                if (res.IsSuccess) {
                    this.offer = res.Data;
                    if (this.offer.Status === 'Offered') {
                        this.isOffered = true;
                    } else if (this.offer.Status === 'Rejected') {
                        this.isOffered = false;
                        this.headerTitle = `Faktura utbetalingstilbud avvist`;
                        this.offerLimitMessage = `Du har brukt  `
                            + `${Math.round(this.offer.Limits.Limit - this.offer.Limits.RemainingLimit)},-`
                            + ` av din totale ramme (${this.offer.Limits.Limit})`;
                    } else if (this.offer.Status === 'UnableToHandle') {
                        this.isOffered = false;
                    }
                } else if (res.Errors && (res.Errors.length || res.ErrorResponse)) {
                    if (res.ErrorType === 'AprilaError' && res.ErrorResponse) {
                        this.validationError = Object.values(res.ErrorResponse);
                    } else {
                        this.validationError = res.Errors;
                    }
                }
            },
            () => {
                this.isError = true;
                this.gettingOfferProgress = false;
            }
        );
    }

    tryAgain() {
        this.isError = false;

        if (!this.isOffered) {
            this.getOffer();
        } else {
            this.acceptOffer();
        }
    }

    acceptOffer() {
        this.offerFeedbackProgress = true;
        this.customerInvoiceService.acceptDeclineAprilaOffer(
            this.options.data.invoiceId, this.offer.OrderId, true, this.offer
        ).subscribe(
            res => {
                this.close({
                    accepted: true
                });
                this.offerFeedbackProgress = false;
            },
            () => {
                this.isError = true;
                this.offerFeedbackProgress = false;
            }
        );
    }

    declineOffer(discard: boolean) {
        this.offerFeedbackProgress = true;
        if (this.isOffered) {
            const orderid = this.isOffered ? this.offer.OrderId : '';
            this.customerInvoiceService.acceptDeclineAprilaOffer(
                this.options.data.invoiceId, orderid, false, null
            ).subscribe(
                () => {
                    this.offerFeedbackProgress = false;
                    if (discard) {
                        this.close(false);
                    } else {
                        this.close({
                            accepted: false
                        });
                    }
                },
                err => {
                    this.errorService.handle(err);
                    this.offerFeedbackProgress = false;
                    this.close(false);
                }
            );
        } else {
            if (discard) {
                this.close(false);
            } else {
                this.close({
                    accepted: false
                });
            }
        }
    }
}
