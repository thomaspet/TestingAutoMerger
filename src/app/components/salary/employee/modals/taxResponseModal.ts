import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AltinnAuthenticationData} from '../../../../models/AltinnAuthenticationData';
import {AltinnIntegrationService, ErrorService} from '../../../../../app/services/services';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {TaxCardReadStatus} from '../../../../unientities';
import {BehaviorSubject} from 'rxjs';
import {Observable} from 'rxjs';

interface ITaxInfo {
    receiptID: number;
    auth: AltinnAuthenticationData;
}

@Component({
    selector: 'tax-response-modal',
    templateUrl: 'taxResponseModal.html'
})

export class TaxResponseModal implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();

    public taxStatus$: BehaviorSubject<TaxCardReadStatus> = new BehaviorSubject(new TaxCardReadStatus());
    public header: string;
    public busy: boolean;

    constructor(
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {

        this.taxStatus$
            .subscribe(status => this.header = status.Title || 'Resultat');

        Observable
            .of(<ITaxInfo>this.options.data)
            .do(() => this.busy = true)
            .switchMap(info => this.altinnService.readTaxCard(info.auth, info.receiptID))
            .catch(err => Observable.of(
                {
                    mainStatus: this.getError(err),
                    Text: '',
                    Title: 'Feil fra Altinn',
                    employeestatus: [],
                    IsJob: false
                }))
            .do(() => {
                const config = this.options.modalConfig;
                if (config.update) {
                    config.update();
                }
            })
            .finally(() => this.busy = false)
            .subscribe((responseMessage) => this.taxStatus$.next(responseMessage));
    }

    private getError(err: any) {
        const msg = this.errorService.extractMessage(err);
        if (msg.toLowerCase().includes('no reference found')) {
            return 'Din skattekortforespørsel er ikke klar enda. Prøv igjen senere.';
        }
        return msg;
    }

    public close() {
        this.onClose.next();
    }
}
