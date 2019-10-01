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

    public showOfferSettings: boolean = false;
    public isShowOffer: boolean;
    public hasPermission: boolean = false;

    public isOffered = false;
    public offer;
    public isOfferAccept = false;
    public headerTitle = '';
    public validationError = [];
    public gettingOfferProgress = false;
    public offerFeedbackProgress = false;

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        if (this.options.data.invoiceId) {
            this.headerTitle = `Faktura ${this.options.data.invoiceNumber} utbetalingstilbud`;
            this.getOffer();
        }
    }

    public close(accpeted) {
        this.onClose.emit(accpeted);
    }

    public toggleShowSetting() {
        this.showOfferSettings = !this.showOfferSettings;
    }

    public getOffer() {
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
                        this.headerTitle = `Faktura ${this.options.data.invoiceNumber} utbetalingstilbud avvist`;
                    } else if (this.offer.Status === 'UnableToHandle') {
                        this.isOffered = false;
                    }
                } else {
                    if (res.Errors && res.Errors.length > 0 || res.ErrorResponse) {
                        if (res.ErrorType === 'AprilaError' && res.ErrorResponse) {
                            this.validationError = Object.values(res.ErrorResponse);
                        } else {
                            this.validationError = res.Errors;
                        }
                    }
                }
            },
            err => {
                this.gettingOfferProgress = false;
                this.errorService.handle(err);
                this.close(true);
            }
        );
    }

    public acceptOffer() {
        this.offerFeedbackProgress = true;
        this.customerInvoiceService.acceptDeclineAprilaOffer(this.options.data.invoiceId, this.offer.OrderId, true, this.offer).
            subscribe(res => {
                this.close(true);
                this.offerFeedbackProgress = false;
            }, err => {
                this.errorService.handle(err);
                this.offerFeedbackProgress = false;
                this.close(true);
            });
    }

    public declineOffer() {

        if (this.isOffered) {
            this.offerFeedbackProgress = true;
            this.customerInvoiceService.acceptDeclineAprilaOffer(this.options.data.invoiceId, this.offer.OrderId, false, null).
                subscribe(res => {
                    this.offerFeedbackProgress = false;
                    this.close(false);
                }, err => {
                    this.errorService.handle(err)
                    this.offerFeedbackProgress = false;
                    this.close(true);
                });
        } else {
            this.close(true);
        }
    }
}
