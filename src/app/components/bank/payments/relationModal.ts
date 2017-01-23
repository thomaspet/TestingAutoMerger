import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {UniModal} from '../../../../framework/modals/modal';
import {StatisticsService, ErrorService} from '../../../services/services';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';

declare const _; // lodash
declare const moment;

@Component({
    selector: 'payment-relations-table',
    template: `
        <article class='modal-content' *ngIf="config">
            <h1>Oversikt over relasjoner/koblinger</h1>
            <p>Trykk på en av linkene under for å åpne aktuell relasjon.</p>
            <uni-table [resource]="lookupFunction" [config]="uniTableConfig"></uni-table>
        </article>
    `
})
export class PaymentRelationsTable implements OnInit {
    @Input() public config: any = {};

    @ViewChild(UniTable) public unitable: UniTable;

    private uniTableConfig: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.uniTableConfig = this.generateUniTableConfig();
        this.lookupFunction = (urlParams: URLSearchParams) =>
            this.getTableData(urlParams).catch(this.errorService.handleRxCatch);
    }

    private getTableData(urlParams: URLSearchParams): Observable<any[]> {
        urlParams = urlParams || new URLSearchParams();

        urlParams.set('model', 'Tracelink');
        urlParams.set('select', 'ID,SourceEntityName,DestinationEntityName,SourceInstanceID,DestinationInstanceID');
        urlParams.set('filter', `TraceLink.Deleted eq 'false' and DestinationEntityName eq 'Payment' and DestinationInstanceID eq ${this.config.paymentID}`);

        return this.statisticsService.GetAllByUrlSearchParams(urlParams);
    }

    private generateUniTableConfig(): UniTableConfig {
        return new UniTableConfig(false, false)
            .setPageable(true)
            .setPageSize(10)
            .setSearchable(false)
            .setColumns([
                new UniTableColumn('TracelinkSourceEntityName', 'Entitet', UniTableColumnType.Text)
                    .setTemplate(data => {
                        if (data.TracelinkSourceEntityName === 'SupplierInvoice') {
                            return `<a href='/#/accounting/bill/${data.TracelinkSourceInstanceID}' target='_blank'>${data.TracelinkSourceEntityName}</a>`;
                        } else if (data.TracelinkSourceEntityName === 'CustomerInvoice') {
                            return `<a href='/#/sales/invoices/${data.TracelinkSourceInstanceID}' target='_blank'>${data.TracelinkSourceEntityName}</a>`;
                        } else {
                            return data.TracelinkSourceEntityName;
                        }
                    }),
                new UniTableColumn('TracelinkSourceInstanceID', 'ID', UniTableColumnType.Text)
            ])
            .setDataMapper(x => x.Data ? x.Data : []);
    }
}

@Component({
    selector: 'payment-relations-modal',
    template: `<uni-modal [type]='type' [config]='modalConfig'></uni-modal>`
})
export class PaymentRelationsModal {
    @ViewChild(UniModal) public modal: UniModal;

    private modalConfig: any = {};
    public type: Type<any> = PaymentRelationsTable;

    constructor(
        private toastService: ToastService
    ) {
        const self = this;

        self.modalConfig = {
            hasCancelButton: false,
            class: 'good'
        };
    }

    public openModal(paymentID: number) {
        this.modalConfig.paymentID = paymentID;

        this.modal.open();

        setTimeout(() => {
            this.modal.getContent().then((cmp: PaymentRelationsTable) => {
                cmp.unitable.refreshTableData();
            });
        });
    }
}
