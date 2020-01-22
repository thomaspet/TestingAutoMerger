import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { CustomerInvoiceService } from '@app/services/services';
import { UniTableColumn, UniTableColumnType, UniTableColumnSortMode, UniTableConfig } from '@uni-framework/ui/unitable';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { ErrorService } from '@app/services/common/errorService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { JournalEntryLineService } from '@app/services/accounting/journalEntryLineService';

@Component({
    selector: 'match-invoice-manual-modal',
    template: `
        <section role="dialog" class="uni-modal large uni-redesign">
            <header>Velg faktura</header>
            <article>
                <p>Beløp igjen for å distribuere: {{amountLeftToDistribute-sumOfSelectedRows}}
                fra innbetalt beløp: {{paymentData.PaymentAmount}}</p>
                <!--<p>Beskrivelse {{paymentData}} </p>-->
                <label>Vis:
                    <select style="width:300px; margin-bottom: 1rem;"
                        (change)="onShowInvoicesFilterChange($event.target.value)">
                        <option value="showNotFullyPaid">kun åpen/delbetalt faktura</option>
                        <option value="showFullyPaid">alle faktura</option>
                    </select>
                </label>
                <ag-grid-wrapper
                    [resource]="customerInvoices"
                    [config]="uniTableConfig"
                    (rowSelectionChange)="onRowSelected($event)">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" [disabled]="!isOkEnabled" (click)="close(true)">Bruk valgt rad(er)</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class MatchCustomerInvoiceManual implements IUniModal {
    @Input()
    public options: IModalOptions = {};


    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public customerInvoices: Array<any> = [];
    public uniTableConfig: UniTableConfig;
    private showPaidInvoices: boolean = false;
    public paymentData: any;
    private journalEntryID: number;
    public amountLeftToDistribute: number;
    public sumOfSelectedRows: number = 0;
    public isOkEnabled: boolean = false;

    constructor(
        private customerInvoiceService: CustomerInvoiceService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private journalEntryLineService: JournalEntryLineService
    ) { }

    public ngOnInit() {
        this.paymentData = this.options.data.model;
        this.statisticsService.GetAllUnwrapped(`model=Tracelink&filter=DestinationEntityName eq 'Payment' `
            + `and SourceEntityName eq 'JournalEntry' `
            + `and Payment.ID eq ${this.paymentData.ID}&join=Tracelink.SourceInstanceId eq JournalEntry.ID as JournalEntry `
            + `and Tracelink.DestinationInstanceId eq Payment.ID&select=JournalEntry.ID as JournalEntryID`)
            .subscribe(data => {
                if (data && data.length > 0) {
                    this.journalEntryID = data.find(x => x.JournalEntryID)['JournalEntryID'];
                    this.amountLeftToDistribute = this.paymentData.PaymentAmount;
                    // transactions are all lines where subaccount is not null
                    this.journalEntryLineService.GetAll(`filter=JournalEntryID eq ${this.journalEntryID} and subAccountID ne null`)
                    .subscribe(jeLines => {
                        jeLines.forEach(line => {
                            this.amountLeftToDistribute = this.amountLeftToDistribute - (line.AmountCurrency * -1);
                        });
                        this.setUpTable();
                    });
                } else {
                    this.toastService.addToast('Ingen bilag funnet', ToastType.bad, 0,
                        'Kan ikke velge faktura manuelt siden det ikke ble funnet noen bilag for denne betalingen');
                    this.close(false);
                }
            });
    }

    public onShowInvoicesFilterChange(value) {
        this.showPaidInvoices = value !== 'showNotFullyPaid';
        this.setUpTable();
    }

    public onRowSelected(selectedRows) {
        this.isOkEnabled = selectedRows.length > 0;
        this.sumOfSelectedRows = 0;
        selectedRows.forEach(row => {
            this.sumOfSelectedRows = this.sumOfSelectedRows + row.RestAmount;
        });
    }

    public close(emitValue?: boolean) {
        const value: Array<number> = emitValue ? this.table.getSelectedRows().map(row => row.ID) : [];
        this.onClose.emit(value);
    }

    public setUpTable() {
        const filter = this.showPaidInvoices ? 'StatusCode ne null' : 'filter=Statuscode ne 42004 and StatusCode ne null';
        this.customerInvoiceService.GetAll(`${filter}`, ['Customer']).subscribe(data => {
            data.forEach(x => x._Pay = 0);
            this.customerInvoices = data;
            const columns = [
                new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text)
                    .setWidth('7rem'),
                new UniTableColumn('Customer.CustomerNumber', 'Kundernr', UniTableColumnType.Text),
                new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text),
                new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate),
                new UniTableColumn('PaymentDueDate', 'Forfalldato', UniTableColumnType.LocalDate),
                new UniTableColumn('OurReference', 'Vår referanse', UniTableColumnType.LocalDate)
                    .setSortMode(UniTableColumnSortMode.Absolute),
                new UniTableColumn('TaxInclusiveAmount', 'Beløp', UniTableColumnType.Money)
                    .setVisible(false)
                    .setSortMode(UniTableColumnSortMode.Absolute),
                new UniTableColumn('CurrencyCodeID', 'Valuta', UniTableColumnType.Text)
                    .setVisible(false),
                new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
                    .setVisible(false),
                new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money)
                    .setSortMode(UniTableColumnSortMode.Absolute),
                new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Money)
                    .setVisible(false)
                    .setSortMode(UniTableColumnSortMode.Absolute),
                new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
                new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                    .setWidth('7rem')
                    .setTemplate(x => this.customerInvoiceService.getStatusText(x.StatusCode, x.InvoiceType)),
                new UniTableColumn('_Pay', 'Innbetal', UniTableColumnType.Money)
                    .setWidth('7rem')
            ];

            let pageSize = (window.innerHeight - 500);

            pageSize = pageSize <= 33 ? 10 : Math.floor(pageSize / 34); // 34 = heigth of a single row

            this.uniTableConfig = new UniTableConfig('common.modal.matchCustomerInvoiceManual', false, true, pageSize)
                .setMultiRowSelect(true)
                .setColumns(columns)
                .setColumnMenuVisible(true)
                .setSearchable(true);
        },
        (err) => this.errorService.handle(err)
        );
    }
}
