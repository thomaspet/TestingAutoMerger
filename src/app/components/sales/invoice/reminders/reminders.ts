import {Component, Input, OnInit} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable/index';
import {
    CustomerInvoice,
    CustomerInvoiceReminder,
    StatusCodeCustomerInvoiceReminder
} from '@app/unientities';

import {
    CustomerInvoiceReminderService,
    StatisticsService,
    ErrorService
} from '@app/services/services';

declare const _;

@Component({
    selector: 'invoice-reminders',
    templateUrl: './reminders.html'
})
export class InvoiceReminders implements OnInit {
    @Input()
    public customerInvoice: CustomerInvoice;

    reminderTable: UniTableConfig;
    reminderList: CustomerInvoiceReminder[];

    restAmountOnInvoice: number = 0;
    sumFee: number = 0;

    private reminderQuery: string = 'model=CustomerInvoiceReminder'
        + '&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.'
        + 'GlobalIdentity&select=ID,StatusCode as StatusCode,RemindedDate as RemindedDate,'
        + 'ReminderNumber as ReminderNumber,DueDate as DueDate,ReminderFeeCurrency as ReminderFeeCurrency,'
        + 'User.DisplayName as CreatedBy&orderby=ID desc&filter=customerinvoiceid%20eq%20';

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService
    ) {

        this.setupReminderTable();
    }

    public ngOnInit() {
        this.updateReminderTable();
    }

    ngOnChanges() {
        if (this.customerInvoice && this.customerInvoice.RestAmountCurrency) {
            this.restAmountOnInvoice = this.customerInvoice.RestAmountCurrency;
        }
    }

    private updateReminderTable() {
        this.statisticsService.GetAll(this.reminderQuery + this.customerInvoice.ID)
            .map(x => x.Data)
            .subscribe(
                (reminders: CustomerInvoiceReminder[]) => {
                    this.reminderList = reminders;

                    let sumFee = 0;
                    if (this.reminderList && this.reminderList.length) {
                        sumFee = this.reminderList.reduce((sum, reminder) => {
                            return reminder.StatusCode < StatusCodeCustomerInvoiceReminder.Paid
                                ? sum + reminder.ReminderFeeCurrency
                                : sum;
                        }, 0);
                    }

                    this.sumFee = sumFee || 0;
                },
                (err) => this.errorService.handle(err)
            );
    }

    private setupReminderTable() {
        // Define columns to use in the table
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr.', UniTableColumnType.Text);
        const remindedDateCol = new UniTableColumn('RemindedDate', 'Purredato', UniTableColumnType.LocalDate);
        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);
        const createdByCol = new UniTableColumn('CreatedBy', 'Opprettet av', UniTableColumnType.Text);
        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setTemplate((reminder) => {
                return this.customerInvoiceReminderService.getStatusText(reminder.StatusCode);
            });

        const feeAmountCol = new UniTableColumn('ReminderFeeCurrency', 'Gebyr', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        // Setup table
        this.reminderTable = new UniTableConfig('sales.inovice.reminders', false, true, 4)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setAutoAddNewRow(false)
            .setColumns([reminderNumberCol, createdByCol, feeAmountCol, remindedDateCol, dueDateCol, statusCol]);
    }
}
