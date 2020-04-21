import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import {IUniModal, IModalOptions, UniModalService} from '../../../../../framework/uni-modal';
import {AltinnIntegrationService, ErrorService} from '../../../../services/services';
import {A06Options, AltinnReceipt, A07Response} from '../../../../unientities';
import {BehaviorSubject} from 'rxjs';
import {ReplaySubject} from 'rxjs';
import {
    IAltinnReceiptListOptions, AltinnReceiptListComponent
} from '../altinn-receipt-list/altinn-receipt-list.component';
import {Observable} from 'rxjs';
import {AltinnAuthenticationModal} from '@app/components/common/modals/AltinnAuthenticationModal';
import {ReconciliationResponseModalComponent} from '../reconciliation-response-modal/reconciliation-response-modal.component';

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
        private modalService: UniModalService
    ) { }

    public ngOnInit() {
        this.receiptListOptions$.next({
            form: 'A06',
            action: (receipt) => {
                return this.modalService
                    .open(AltinnAuthenticationModal)
                    .onClose
                    .filter(result => !!result)
                    .switchMap(result => this.altinnIntegrationService.getA07Response(result, receipt.ReceiptID))
                    .do(result => this.modalService.open(ReconciliationResponseModalComponent, {data: result}))
                    .do(result => this.handleA07Response(result));
            },
            actionText: 'Last ned',
            title: 'Last ned avstemming'
        });
    }

    private handleA07Response(response: A07Response) {
        if (!response.Data) {
            return;
        }
    }

    public onReconciliationRequest() {
        this.receiptList.refreshList();
    }

    public close() {
        this.onClose.next();
    }
}
