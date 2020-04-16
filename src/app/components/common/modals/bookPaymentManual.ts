import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import { UniTableColumn, UniTableColumnType, UniTableColumnSortMode, UniTableConfig } from '@uni-framework/ui/unitable';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { JournalEntryLineService } from '@app/services/accounting/journalEntryLineService';
import { ErrorService } from '@app/services/common/errorService';
import { LocalDate } from '@uni-entities';
import { PaymentService, StatisticsService } from '@app/services/services';
import { Observable } from 'rxjs';


@Component({
    selector: 'book-payment-manual-modal',
    template: `
        <section role="dialog" class="uni-modal large">
            <header>Bokfør manuelt</header>
            <article>
                <p>Velg en motpost for betalingen</p>
                <label>Vis:
                    <select style='width:300px'
                        (change)="onShowPostsFilterChange($event.target.value)">
                        <option value="showOpen">kun åpne kreditposter</option>
                        <option value="showMarked">alle poster</option>
                    </select>
                </label>
                <label> Fra:
                    <select style='width:300px'
                        [(ngModel)]="selectedBusinessRelationID"
                        (change)="onBusinesRelationFilterChange($event.target.value)">
                        <option></option>
                        <option *ngFor="let relation of businessRelations"
                            [value]="relation.ID">
                            {{relation.Name}}
                        </option>
                    </select>
                </label>
                <ag-grid-wrapper
                    [resource]="journalEntryLines"
                    [config]="uniTableConfig"
                    (rowSelect)="onRowSelected($event)">
                </ag-grid-wrapper>
            </article>

            <footer>
                <button class="good" [disabled]="!selectedRow" (click)="close(true)">Bokfør valgt rad</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class BookPaymentManualModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public supplierID: number;
    public customerID: number;
    public accountID: number;
    public pointInTime: LocalDate;

    private companySettings: any;
    public journalEntryLines: Array<any> = [];
    public uniTableConfig: UniTableConfig;
    public selectedRow: any;
    private paymentData: any;
    public businessRelations: any[];
    public selectedBusinessRelationID: number;
    private showMarkedPosts: boolean = false;

    constructor(
        private journalEntryLineService: JournalEntryLineService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private paymentService: PaymentService,
        private statisticsService: StatisticsService

    ) { }

    public ngOnInit() {
        this.paymentData = this.options.data.model;
        Observable.forkJoin(
            this.companySettingsService.Get(1),
            this.paymentService.Get(this.paymentData.ID, ['ToBankAccount']),
            this.statisticsService.GetAllUnwrapped(`model=journalentryline`
            + `&select=subaccount.accountnumber,subaccount.accountname as Name,sum(amount) as ib,`
            + `subaccount.supplierid as supplierID,subaccount.customerid as customerID,`
            + `subaccount.accountid as accountID,`
            + `casewhen(Customer.BusinessRelationID gt 0,Customer.BusinessRelationID,Supplier.BusinessRelationID) as ID`
            + `&filter=subaccountid gt 0`
            + `&join=Account.AccountNumber eq Customer.customernumber and Account.AccountNumber eq Supplier.suppliernumber`
            + `&having=sum(amount) ne 0&orderby=subaccount.accountnumber&expand=subaccount`)
        )
        .subscribe(data => {
            this.companySettings = data[0];
            this.selectedBusinessRelationID = data[1].ToBankAccount.BusinessRelationID;
            this.businessRelations = data[2];
            const br = this.businessRelations.find(x => x.ID === this.selectedBusinessRelationID);
            this.customerID = br.customerID;
            this.supplierID = br.supplierID;
            this.accountID = br.accountID;
            this.setUpTable();
        },
        err => this.errorService.handle(err)
        );
    }

    public close(emitValue?: boolean) {
        let value: any;
        if (emitValue) {
            value = this.selectedRow.JournalEntryID;
        }

        this.onClose.emit(value);
    }

    public onShowPostsFilterChange(value) {
        this.showMarkedPosts = value !== 'showOpen';
        this.setUpTable();
    }

    public onBusinesRelationFilterChange(value) {
        const br = this.businessRelations.find(x => x.ID === +value);
        if (br) {
            this.customerID = br.customerID;
            this.supplierID = br.supplierID;
             this.accountID = br.accountID;
        } else {
            this.customerID = null;
            this.supplierID = null;
            this.accountID = null;
        }
        this.setUpTable();
    }

    public onRowSelected(event) {
        this.selectedRow = event.rowModel;
    }

    private setUpTable() {
        this.journalEntryLineService.getJournalEntryLinePostPostData(
            true,
            this.showMarkedPosts,
            this.customerID,
            this.supplierID,
            this.accountID,
            this.pointInTime)
            .subscribe((data: Array<any>) => {
                // Only show entries with negative amount
                if (!this.showMarkedPosts) {
                    data = data.filter(x => x.Amount < 0);
                }

                this.journalEntryLines = data;
                const columns = [
                    new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Text)
                        .setWidth('7rem'),
                    new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                        .setTemplate(x => x.JournalEntryTypeName)
                        .setVisible(false),
                    new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
                    new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
                    new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime),
                    new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money)
                        .setSortMode(UniTableColumnSortMode.Absolute),
                    new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Money)
                        .setVisible(false)
                        .setSortMode(UniTableColumnSortMode.Absolute),
                    new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
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
                        .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode)),
                    new UniTableColumn('NumberOfPayments', 'Bet.', UniTableColumnType.Text)
                        .setWidth('60px')
                        .setTemplate(
                            x => x.NumberOfPayments > 0
                                ? `${x.NumberOfPayments}`
                                : ''
                        ),
                    new UniTableColumn('Markings', 'Motpost', UniTableColumnType.Text)
                        .setTemplate(item => {
                            return this.getMarkingsText(item);
                        })
                ];

                this.uniTableConfig = new UniTableConfig('common.modal.bookPaymentManual', false, true, 25)
                    .setColumns(columns)
                    .setColumnMenuVisible(true)
                    .setSearchable(true);
                },
                (err) => this.errorService.handle(err)
            );
    }

    private getMarkingsText(item): string {
        return (item.Markings || [])
            .sort((x, y) => x.JournalEntryNumber > y.JournalEntryNumber)
            .map(x => x.JournalEntryNumber.split('-')[0])
            .join(',');
    }
}
