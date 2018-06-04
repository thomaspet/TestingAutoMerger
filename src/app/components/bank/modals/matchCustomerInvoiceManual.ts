import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { CustomerInvoice, JournalEntry } from '@uni-entities';
import { CustomerInvoiceService } from '@app/services/services';
import { UniTableColumn, UniTableColumnType, UniTableColumnSortMode, UniTableConfig, UniTable } from '@uni-framework/ui/unitable';
import { ErrorService } from '@app/services/common/errorService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { JournalEntryData } from '@app/models/models';
import { JournalEntryLineService } from '@app/services/accounting/journalEntryLineService';

@Component({
    selector: 'match-invoice-manual-modal',
    template: `
        <section role="dialog" class="uni-modal large">
            <header>
                <h1>Valg faktura</h1>
            </header>
            <article>
                <p>Beløp igjen for å distribuere: {{amountLeftToDistribute-sumOfSelectedRows}}
                fra innbetalt beløp: {{paymentData.PaymentAmount}}</p>
                <!--<p>Beskrivelse {{paymentData}} </p>-->
                <label>Vis:
                    <select style='width:300px'
                        (change)="onShowInvoicesFilterChange($event.target.value)">
                        <option value="showNotFullyPaid">kun åpen/delbetalt faktura</option>
                        <option value="showFullyPaid">alle faktura</option>
                    </select>
                </label>
                <uni-table
                    [resource]="customerInvoices"
                    [config]="uniTableConfig"
                    (rowSelectionChanged)="onRowSelected($event)"
                    >
                </uni-table>
            </article>

            <footer>
                <button class="good" [disabled]="!isOkEnabled" (click)="close(true)">Bruk valgt rad</button>
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

    @ViewChild(UniTable)
    private table: UniTable;

    private customerInvoices: Array<any> = [];
    public uniTableConfig: UniTableConfig;
    private showPaidInvoices: boolean = false;
    private paymentData: any;
    private journalEntryID: number;
    private amountLeftToDistribute: number;
    private sumOfSelectedRows: number = 0;
    private isOkEnabled: boolean = false;

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
                        'Kan ikke valger faktura manuelt siden ingen bilag ble funnet for denne betaling');
                    this.close(false);
                }
            });
    }

    public onShowInvoicesFilterChange(value) {
        this.showPaidInvoices = value !== 'showNotFullyPaid';
        this.setUpTable();
    }

    public onRowSelected(selectedRows) {
        this.isOkEnabled = this.table.getSelectedRows().length > 0;
        this.sumOfSelectedRows = 0;
        this.table.getSelectedRows().forEach(row => {
            this.sumOfSelectedRows = this.sumOfSelectedRows + row.RestAmount;
        });
    }

    public close(emitValue?: boolean) {
        let value: Array<number> = [];
        if (emitValue) {
            this.table.getSelectedRows().forEach(element => {
                value.push(element.ID);
            });
        }
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

            this.uniTableConfig = new UniTableConfig('common.modal.matchCustomerInvoiceManual', false, true, 25)
                .setMultiRowSelect(true)
                .setColumns(columns)
                .setColumnMenuVisible(true)
                .setSearchable(true);
        },
        (err) => this.errorService.handle(err)
        );
    }
}
