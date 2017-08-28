import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AltinnAuthenticationData } from '../../../../models/AltinnAuthenticationData';
import { AltinnIntegrationService, ErrorService } from '../../../../../app/services/services';
import { IUniModal, IModalOptions } from '../../../../../framework/uniModal/barrel';

type TaxInfo = {
    receiptID: number,
    auth: AltinnAuthenticationData
}

@Component({
    selector: 'tax-response-modal',
    templateUrl: 'taxResponseModal.html'
})

export class TaxResponseModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    private responseMessage: string;
    public busy: boolean;
    constructor(
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() { 
        let info: TaxInfo = this.options.data;
        let config = this.options.modalConfig;
        this.altinnService
            .readTaxCard(info.auth, info.receiptID)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do(() => {
                if (config.changeEvent) {
                    config.changeEvent.next(true);
                }
            })
            .subscribe((responseMessage) => {
                this.responseMessage = responseMessage;
            });
    }

    public close() {
        this.onClose.next(!!this.responseMessage);
    }
}
