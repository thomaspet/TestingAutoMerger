import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {AltinnReceiptService} from '@app/services/services';
import {ReplaySubject, BehaviorSubject} from 'rxjs';
import {AltinnReceipt} from '@uni-entities';
import {IUniTableConfig, UniTableConfig, UniTableColumn, UniTableColumnType, UniTable} from '@uni-framework/ui/unitable';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-altinn-overview',
    templateUrl: './altinn-overview.component.html',
    styleUrls: ['./altinn-overview.component.sass']
})
export class AltinnOverviewComponent implements OnInit, AfterViewInit {

    public receipts$: BehaviorSubject<AltinnReceipt[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<IUniTableConfig> = new BehaviorSubject(null);
    public selectedReceipt$: BehaviorSubject<AltinnReceipt> = new BehaviorSubject(null);
    public busy: boolean;
    @ViewChild(UniTable) private table: UniTable;
    private table$: ReplaySubject<UniTable> = new ReplaySubject(1);
    constructor(
        private altinnReceiptService: AltinnReceiptService,
        private tabService: TabService
    ) {}

    public ngOnInit() {
        this.altinnReceiptService
            .GetAll('orderby= TimeStamp desc')
            .map(receipts => this.updateStatuses(receipts))
            .do(receipts => this.receipts$.next(receipts))
            .subscribe(receipts => this.focus(receipts[0]));

        this.config$
            .next(this.getConfig());

        this.tabService.addTab({
            moduleID: UniModules.AltinnOverview,
            url: 'salary/altinnoverview',
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
        this.table$
            .take(1)
            .delay(200)
            .subscribe(table => {
                const tableRow = table
                    .getTableData()
                    .find(row => row.ID === receipt.ID);
                if (!tableRow) {
                    return;
                }
                table.focusRow(tableRow['_originalIndex']);
            });
    }

    public updateSelected(row: any) {
        this.selectedReceipt$.next(row.rowModel);
    }

}
