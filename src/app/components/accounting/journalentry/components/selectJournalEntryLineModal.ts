import {Component, Input, Output, EventEmitter} from '@angular/core';
import {UniTableColumn, UniTableConfig, UniTableColumnType} from '../../../../../framework/ui/unitable/index';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {JournalEntryLineService} from '../../../../services/services';

@Component({
    selector: 'select-journalentryline-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw">
            <header>Velg faktura</header>
            <article class='modal-content' *ngIf="config">
                <p>Trykk på en av linjene under for å knytte bilagslinjen til en av fakturaene</p>
                <ag-grid-wrapper
                    [resource]="config.journalentrylines"
                    [config]="uniTableConfig"
                    (rowSelect)="close($event)">
                </ag-grid-wrapper>
            </article>
        </section>
    `
})
export class SelectJournalEntryLineModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter<any>();

    public uniTableConfig: UniTableConfig;
    public config: any = {};

    constructor( private journalEntryLineService: JournalEntryLineService ) { }

    public ngOnInit() {
        this.config = {
            hasCancelButton: false,
            journalentrylines: this.options.data.journalentrylines,
            class: 'good'
        };

        this.generateUniTableConfig();
    }

    private generateUniTableConfig() {
        const columns = [
            new UniTableColumn('JournalEntryNumber', 'Bilagsnr', UniTableColumnType.Text),
            new UniTableColumn('JournalEntryType.Name', 'Type', UniTableColumnType.Text)
                .setTemplate(x => x.JournalEntryTypeName)
                .setVisible(false),
            new UniTableColumn('FinancialDate', 'Dato', UniTableColumnType.LocalDate),
            new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text),
            new UniTableColumn('DueDate', 'Forfall', UniTableColumnType.DateTime),
            new UniTableColumn('Account.AccountNumber', 'Kontonr', UniTableColumnType.Text)
                .setWidth('100px')
                .setTemplate(row => {
                    return row.SubAccount ? row.SubAccount.AccountNumber : row.Account.AccountNumber;
                }),
            new UniTableColumn('Account.AccountName', 'Konto', UniTableColumnType.Text)
                .setTemplate(row => {
                    return row.SubAccount ? row.SubAccount.AccountName : row.Account.AccountName;
                }),
            new UniTableColumn('Amount', 'Beløp', UniTableColumnType.Money),
            new UniTableColumn('AmountCurrency', 'V-Beløp', UniTableColumnType.Money)
                .setVisible(false),
            new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
                .setVisible(false),
            new UniTableColumn('CurrencyExchangeRate', 'V-Kurs', UniTableColumnType.Number)
                .setVisible(false),
            new UniTableColumn('RestAmount', 'Restbeløp', UniTableColumnType.Money),
            new UniTableColumn('RestAmountCurrency', 'V-Restbeløp', UniTableColumnType.Money)
                .setVisible(false),
            new UniTableColumn('Description', 'Beskrivelse', UniTableColumnType.Text),
            new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
                .setTemplate(x => this.journalEntryLineService.getStatusText(x.StatusCode))
        ];

        this.uniTableConfig = new UniTableConfig('accounting.journalEntry.selectJournalEntryLineModal', false, false, 100)
            .setColumns(columns)
            .setColumnMenuVisible(true);
    }

    public close(data) {
        this.onClose.emit(data);
    }
}
