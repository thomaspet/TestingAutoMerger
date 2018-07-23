import {Component, Input, OnInit} from '@angular/core';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {IUniSaveAction} from '@uni-framework/save/save';
import {ISummaryConfig} from '@app/components/common/summary/summary';
import {UniModalService, ConfirmActions} from '@uni-framework/uni-modal';
import {
    NumberFormat,
    CustomerInvoiceService,
    StatisticsService,
    ErrorService,
    CustomerInvoiceReminderService
} from '@app/services/services';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    IContextMenuItem,
    INumberFormat
} from '@uni-framework/ui/unitable/index';
import { CustomerInvoiceReminder } from '@uni-entities';

declare const _;

@Component({
    selector: 'debtcollector-sending',
    templateUrl: './sentToDebtCollection.html'
})

export class SentToDebtCollection implements OnInit {
    public remindersToDebtCollect: CustomerInvoiceReminder[];
    public reminderToDebtCollectTable: UniTableConfig;
    private showInvoicesWithReminderStop: boolean = false;
    public summaryFields: ISummaryConfig[] = [];

    public summaryData: any = {
        restSumReadyForDebtCollection: 0,
        restSumChecked: 0
    };

    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 2
    };

    public toolbarconfig: IToolbarConfig = {
        title: 'Sendt til inkasso',
    };

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private reminderService: CustomerInvoiceReminderService,
        private customerInvoiceService: CustomerInvoiceService,
        private numberFormatService: NumberFormat,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.setupRemindersToDebtCollectTable();
    }

    public onRowSelectionChange(selectedRows) {
        let restSumChecked = 0;

        selectedRows.forEach(row => restSumChecked += row.RestAmount);
        this.summaryData.restSumChecked = restSumChecked;
        this.setSums();
    }

    private setSums() {
        this.summaryFields = [
            {
                value: this.summaryData
                    ? this.numberFormatService.asMoney(this.summaryData.restSumReadyForDebtCollection)
                    : null,
                title: 'Totalt restsum til inkasso',
            },
            {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.restSumChecked) : null,
                title: 'Totalt restsum valgt',
            }
        ];
    }

    public updateReminderTable() {
        this.reminderService.getCustomerInvoicesSentToDebtCollection(
            this.showInvoicesWithReminderStop
        ).subscribe(
            res => {
                // Add status code text to reminders
                this.remindersToDebtCollect = (res || []).map(reminder => {
                    reminder['_statusText'] = this.reminderService.getStatusText(reminder.StatusCode);
                    return reminder;
                });
    
                this.summaryData.restSumChecked = 0;
                this.summaryData.restSumReadyForDebtCollection = _.sumBy(
                    this.remindersToDebtCollect, x => x.RestAmount
                );
                
                this.setSums();
            },
            err => this.errorService.handle(err)
        );
    }

    private setupRemindersToDebtCollectTable() {
        this.updateReminderTable();

        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr')
            .setWidth('100px')
            .setFilterOperator('contains');

        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setFilterOperator('contains')
            .setLinkResolver(row => `/sales/invoices/${row.CustomerInvoiceID}`);

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setFilterOperator('startswith')
            .setLinkResolver(row => `/sales/customer/${row.CustomerID}`);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde')
            .setFilterOperator('contains')
            .setLinkResolver(row => `/sales/customer/${row.CustomerID}`);

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.DateTime)
            .setFilterOperator('contains');

        const invoiceDueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.DateTime)
            .setFilterOperator('contains');

        const currencyCodeCol = new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text)
            .setWidth('100px')
            .setFilterOperator('contains');

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setTemplate(row => row['_statusText']);

        const taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number)
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const configStoreKey = 'sales.reminders.reminderToDebtCollect';
        this.reminderToDebtCollectTable = new UniTableConfig(configStoreKey, false, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol,
                currencyCodeCol, taxInclusiveAmountCurrencyCol, restAmountCurrencyCol,
                invoiceDateCol, invoiceDueDateCol, statusCol
            ]);
    }
}
