import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { CustomerInvoiceService, ErrorService } from '@app/services/services';


@Component({
    selector: 'aprila-offer-modal',
    templateUrl: './aprila-offer-modal.html',
    styleUrls: ['./aprila-offer-modal.sass']
})
export class AprilaOfferModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions = {};
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
    public isError = false;
    offerLimitMessage = '';
    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    constructor(private customerInvoiceService: CustomerInvoiceService, private errorService: ErrorService) { }

    public ngOnInit() {

        if (this.options.data.invoiceId) {
            this.headerTitle = `Faktura ${this.options.data.invoiceNumber} utbetalings tilbud`;
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
        this.customerInvoiceService.getAprilaOffer(this.options.data.invoiceId).subscribe(res => {

            if (res.IsSuccess) {
                this.offer = res.Data;
                if (this.offer.Status === 'Offered') {
                    this.isOffered = true;
                } else if (this.offer.Status === 'Rejected') {
                    this.isOffered = false;
                    this.headerTitle = `Faktura ${this.options.data.invoiceNumber} utbetalings tilbud avvist`;
                    this.offerLimitMessage = `Du har brukt  ${Math.round(this.offer.Limits.Limit - this.offer.Limits.RemainingLimit)},
                    - av din totale ramme (${this.offer.Limits.Limit})`;
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
        }, err => {
            this.isError = true;
            this.gettingOfferProgress = false;
        }
            , () => this.gettingOfferProgress = false);
    }

    tryAgain() {
        this.isError = false;

        if (!this.isOffered) {
            this.getOffer();
        } else {
            this.acceptOffer();
        }
    }

    public acceptOffer() {
        this.offerFeedbackProgress = true;
        this.customerInvoiceService.acceptDeclineAprilaOffer(this.options.data.invoiceId, this.offer.OrderId, true, this.offer).
            subscribe(res => {
                this.close(true);
                this.offerFeedbackProgress = false;
            }, err => {
                this.isError = true;
                this.offerFeedbackProgress = false;

            });
    }

    public declineOffer() {
        this.offerFeedbackProgress = true;
        const orderid = this.isOffered ? this.offer.OrderId : '';
        this.customerInvoiceService.acceptDeclineAprilaOffer(this.options.data.invoiceId, orderid, false, null).
            subscribe(res => {
                this.offerFeedbackProgress = false;
                this.close(false);
            }, err => {
                this.handleError(err);
                this.offerFeedbackProgress = false;
                this.close(false);
            });
    }

    public handleError(error) {
        this.errorService.handle(error);
    }

}
