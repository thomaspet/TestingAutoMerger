import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AltinnReceiptService } from '@app/services/services';
import { BehaviorSubject } from 'rxjs';
import { AltinnReceipt } from '@uni-entities';
import { IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ReplaySubject } from 'rxjs';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { Observable } from 'rxjs';
import { IUniSaveAction } from '@uni-framework/save/save';
import { Router } from '@angular/router';
import { UniModalService } from '@uni-framework/uni-modal';
import { TaxReportModal } from '../taxreport/taxreportModal';

@Component({
    selector: 'uni-altinn-overview',
    templateUrl: './altinn-overview.component.html',
    styleUrls: ['./altinn-overview.component.sass']
})
export class AltinnOverviewComponent implements OnInit, AfterViewInit {

    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

    receipts$: BehaviorSubject<AltinnReceipt[]> = new BehaviorSubject([]);
    config$: BehaviorSubject<IUniTableConfig> = new BehaviorSubject(null);
    selectedReceipt$: BehaviorSubject<AltinnReceipt> = new BehaviorSubject(null);
    busy: boolean;
    actions: IUniSaveAction[] = [
        {
            label: 'Rapporter Selvstendig næringsdrivende',
            action: () => this.router.navigateByUrl('/altinn/selfemployed'),
            disabled: false,
            main: true
        },
        {
            label: 'Rapporter Pass og stell av barn',
            action: () => this.router.navigateByUrl('/altinn/childcare'),
            disabled: false,
            main: false
        },
        {
            label: 'Skattemelding',
            action: () => this.router.navigateByUrl('/altinn/skattemelding'),
            disabled: false,
            main: false
        },
        {
            label: 'Test årsoppgjør',
            action: () => this.modalService.open(TaxReportModal)/*.onClose.subscribe(() => { })*/,
            disabled: false,
            main: false
        }
    ];

    private table$: ReplaySubject<AgGridWrapper> = new ReplaySubject(1);

    constructor(
        private altinnReceiptService: AltinnReceiptService,
        private tabService: TabService,
        private modalService: UniModalService,
        private router: Router,
    ) { }

    public ngOnInit() {
        this.altinnReceiptService
            .GetAll('orderby= TimeStamp desc')
            .map(receipts => this.updateStatuses(receipts))
            .do(receipts => this.receipts$.next(receipts))
            .subscribe(receipts => this.focus(receipts[0]));


        this.config$.next(this.getConfig());

        this.tabService.addTab({
            moduleID: UniModules.AltinnOverview,
            url: 'altinn/overview',
            name: 'Altinn oversikt'
        });
    }

    public ngAfterViewInit(): void {
        this.table$.next(this.table);
    }

    private updateRow(receipt: AltinnReceipt) {
        this.receipts$
            .take(1)
            .map(receipts => {
                const index = receipts.findIndex(rcpt => rcpt.ID === receipt.ID);
                return [...receipts.slice(0, index), receipt, ...receipts.slice(index + 1, receipts.length)];
            })
            .subscribe(receipts => this.receipts$.next(receipts));
    }

    public updateReceipt() {
        this.selectedReceipt$
            .take(1)
            .do(() => this.busy = true)
            .switchMap(receipt => this.altinnReceiptService
                .updateAltinnReceipt(receipt.ID))
            .do(receipt => this.updateRow(receipt))
            .finally(() => this.busy = false)
            .subscribe(receipt => {
                const selected = this.selectedReceipt$.getValue();
                if (!selected || selected.ID !== receipt.ID) {
                    return;
                }
                this.focus(receipt);
            });
    }

    private updateStatuses(receipts: AltinnReceipt[]): AltinnReceipt[] {
        return receipts.map(receipt => this.updateStatus(receipt));
    }

    private updateStatus(receipt: AltinnReceipt): AltinnReceipt {
        return receipt;
    }

    private getConfig(): IUniTableConfig {

        const formCol = new UniTableColumn('Form', 'Skjema', UniTableColumnType.Text)
            .setWidth('5rem');
        const timeStampCol = new UniTableColumn('TimeStamp', 'Sendt', UniTableColumnType.DateTime)
            .setFormat('DD.MM.YYYY HH:mm:ss');
        const signatureCol = new UniTableColumn('UserSign', 'Signatur', UniTableColumnType.Text);
        const errorMsgCol = new UniTableColumn('ErrorText', 'Feilmelding', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('_status', 'Status', UniTableColumnType.Text);

        return new UniTableConfig('salary.altinn-overview', false)
            .setColumns([formCol, timeStampCol, signatureCol]);
    }

    private focus(receipt: AltinnReceipt) {
        if (!receipt) {
            return;
        }
        this.receipts$
            .take(1)
            .delay(200)
            .switchMap(receipts => Observable.forkJoin(Observable.of(receipts), this.table$.take(1)))
            .subscribe((result) => {
                const [receipts, table] = result;
                const receiptRows = receipts.find(row => row.ID === receipt.ID);
                if (!receiptRows) {
                    return;
                }
                table.focusRow(receiptRows['_originalIndex']);
            });
    }

    public updateSelected(row: AltinnReceipt) {
        this.selectedReceipt$.next(row);
    }
}
