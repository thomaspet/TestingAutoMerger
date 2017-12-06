import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';
import {AltinnIntegrationService, ErrorService} from '../../../../../app/services/services';
import {IUniModal, IModalOptions} from '../../../../../framework/uniModal/barrel';
import {TaxCardReadStatus} from '../../../../unientities';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

type TaxInfo = {
    receiptID: number,
    auth: AltinnAuthenticationData
};

@Component({
    selector: 'tax-response-modal',
    templateUrl: 'taxResponseModal.html'
})

export class TaxResponseModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    private taxStatus$: BehaviorSubject<TaxCardReadStatus> = new BehaviorSubject(new TaxCardReadStatus());
    private header: string;
    public busy: boolean;
    constructor(
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {

        this.taxStatus$
            .subscribe(status => this.header = status.Title || 'Resultat');

        Observable
            .of(<TaxInfo>this.options.data)
            .do(() => this.busy = true)
            .switchMap(info => this.altinnService.readTaxCard(info.auth, info.receiptID))
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .do(() => {
                let config = this.options.modalConfig;
                if (config.update) {
                    config.update();
                }
            })
            .finally(() => this.busy = false)
            .subscribe((responseMessage) => this.taxStatus$.next(responseMessage));
    }

    public close() {
        this.onClose.next();
    }
}
