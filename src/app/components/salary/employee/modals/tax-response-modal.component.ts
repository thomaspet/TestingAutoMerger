import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import { AltinnAuthenticationData } from '@app/models/AltinnAuthenticationData';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { TaxCardReadStatus } from '@uni-entities';
import { AltinnAuthenticationService, AltinnIntegrationService, ErrorService } from '@app/services/services';
import { tap, switchMap, catchError, finalize } from 'rxjs/operators';

interface ITaxInfo {
    receiptID: number;
    auth: AltinnAuthenticationData;
}

@Component({
    selector: 'tax-response-modal',
    templateUrl: 'tax-response-modal.component.html'
})

export class TaxResponseModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();

    public taxStatus$: BehaviorSubject<TaxCardReadStatus> = new BehaviorSubject(new TaxCardReadStatus());
    public header: string;
    public busy: boolean;

    constructor(
        private altinnAuthService: AltinnAuthenticationService,
        private altinnService: AltinnIntegrationService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.taxStatus$
            .subscribe(status => this.header = status.Title || 'Resultat');
        this.readTaxCard(this.options.data);
    }

    private readTaxCard(info: ITaxInfo) {
        this.altinnService
            .readTaxCard(info.auth, info.receiptID)
            .pipe(
                tap(() => this.busy = true),
                catchError(err => {
                    this.altinnAuthService.clearAltinnPinFromLocalStorage();
                    return of(
                        {
                            mainStatus: this.getError(err),
                            Text: '',
                            Title: 'Feil fra Altinn',
                            employeestatus: [],
                            IsJob: false,
                        }
                    );
                }),
                tap(() => {
                    const config = this.options.modalConfig;
                    if (config.update) {
                        config.update();
                    }
                }),
                finalize(() => this.busy = false),
            )
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
