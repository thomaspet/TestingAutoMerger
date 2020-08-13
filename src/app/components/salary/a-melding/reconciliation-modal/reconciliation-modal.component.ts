import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import {AltinnIntegrationService, ErrorService, AltinnAuthenticationService} from '@app/services/services';
import {A06Options, A07Response} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {
    IAltinnReceiptListOptions, AltinnReceiptListComponent
} from '@app/components/salary/a-melding/altinn-receipt-list/altinn-receipt-list.component';
import {AltinnAuthenticationModal} from '@app/components/common/modals/AltinnAuthenticationModal';
import {ReconciliationResponseModalComponent} from '@app/components/salary/a-melding/reconciliation-response-modal/reconciliation-response-modal.component';
import { filter, tap, switchMap, catchError } from 'rxjs/operators';
import { IUniModal, IModalOptions, UniModalService } from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-reconciliation-modal',
    templateUrl: './reconciliation-modal.component.html',
    styleUrls: ['./reconciliation-modal.component.sass']
})
export class ReconciliationModalComponent implements OnInit, IUniModal {
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @Input() public options?: IModalOptions;
    @ViewChild(AltinnReceiptListComponent, { static: true }) public receiptList: AltinnReceiptListComponent;
    public receiptListOptions$: ReplaySubject<IAltinnReceiptListOptions> = new ReplaySubject(1);
    public model: BehaviorSubject<A06Options> = new BehaviorSubject(new A06Options());


    constructor(
        private altinnIntegrationService: AltinnIntegrationService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private altinnAuthService: AltinnAuthenticationService,
    ) { }

    public ngOnInit() {
        this.receiptListOptions$.next({
            form: 'A06',
            action: (receipt) => {
                return this.modalService
                    .open(AltinnAuthenticationModal)
                    .onClose
                    .pipe(
                        filter(result => !!result),
                        switchMap(result => this.altinnIntegrationService.getA07Response(result, receipt.ReceiptID)),
                        tap(result => this.modalService.open(ReconciliationResponseModalComponent, {data: result})),
                        catchError((err, obs) => {
                            this.altinnAuthService.clearAltinnPinFromLocalStorage();
                            return this.errorService.handleRxCatch(err, obs);
                        }),
                    );
            },
            actionText: 'Last ned',
            title: 'Last ned avstemming'
        });
    }

    public onReconciliationRequest() {
        this.receiptList.refreshList();
    }

    public close() {
        this.onClose.next();
    }
}
