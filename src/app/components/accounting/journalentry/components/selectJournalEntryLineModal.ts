import {Component, Type, Input, Output, ViewChild, EventEmitter, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {UniModal} from '../../../../../framework/modals/modal';
import {JournalEntryLine} from '../../../../../app/unientities';
import {PeriodDateFormatPipe} from '../../../../pipes/periodDateFormatPipe';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {
    JournalEntryLineService,
    PeriodService,
    ErrorService
} from '../../../../services/services';


@Component({
    selector: 'select-journalentryline-table',
    template: `
        <article class='modal-content' *ngIf="config">
            <h1>Velg faktura</h1>
            <p>Trykk på en av linjene under for å knytte bilagslinjen til en av fakturaene</p>
            <uni-table [resource]="config.journalentrylines" [config]="uniTableConfig" (rowSelected)="selectedItemChanged($event)"></uni-table>
        </article>
    `
})
export class SelectJournalEntryLineTable implements OnInit {
    @Input() public config: any = {};

    @ViewChild(UniTable) public unitable: UniTable;

    @Output() public vatReportSelected: EventEmitter<any> = new EventEmitter<any>();

    private uniTableConfig: UniTableConfig;
    private periodDateFormat: PeriodDateFormatPipe;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private journalEntryLineService: JournalEntryLineService
    ) {
        this.periodDateFormat = new PeriodDateFormatPipe(this.errorService);
    }

    public ngOnInit() {
        this.generateUniTableConfig();
    }


    private generateUniTableConfig() {
        let columns = [
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

        this.uniTableConfig = new UniTableConfig(false, false, 100)
            .setColumns(columns)
            .setColumnMenuVisible(true);
    }

    private selectedItemChanged(data: any) {
        let line: JournalEntryLine = data.rowModel;
        this.config.journalEntryLineSelected(line);
    }
}

@Component({
    selector: 'select-journalentryline-modal',
    template: `<uni-modal [type]='type' [config]='modalConfig'></uni-modal>`
})
export class SelectJournalEntryLineModal {
    @ViewChild(UniModal)
    public modal: UniModal;

    @Output() public journalEntryLineSelected: EventEmitter<any> = new EventEmitter<any>();

    private modalConfig: any = {};
    public type: Type<any> = SelectJournalEntryLineTable;

    private promiseResolver: (JournalEntryLine) => void;

    constructor(
        private periodService: PeriodService,
        private toastService: ToastService
    ) {
        const self = this;

        self.modalConfig = {
            hasCancelButton: false,
            class: 'good',
            journalEntryLineSelected: (data) => {
                this.journalEntryLineSelected.emit(data);
                this.promiseResolver(data);

                this.modal.close();
            }
        };
    }

    public openModal(journalentrylines: Array<JournalEntryLine>): Promise<JournalEntryLine> {
        return new Promise((resolve) => {
            this.promiseResolver = resolve;

            this.modalConfig.journalentrylines = journalentrylines;
            this.modal.open();

            setTimeout(() => {
                this.modal.getContent().then((cmp: SelectJournalEntryLineTable) => {
                    cmp.unitable.refreshTableData();
                });
            });
        });
    }
}
