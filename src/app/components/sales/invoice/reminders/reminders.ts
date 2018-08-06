import {Component, Input, OnInit} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../../framework/ui/unitable/index';
import {Router} from '@angular/router';
import {
    CustomerInvoice
} from '../../../../unientities';

import {
    NumberFormat,
    CustomerInvoiceReminderService,
    StatisticsService,
    ErrorService
} from '../../../../services/services';

declare const _;

@Component({
    selector: 'invoice-reminders',
    templateUrl: './reminders.html'
})
export class InvoiceReminders implements OnInit {
    @Input()
    public customerInvoice: CustomerInvoice;

    private reminderTable: UniTableConfig;
    private reminderList: any;
    private sumFee: number = 0;

    private reminderQuery: string = 'model=CustomerInvoiceReminder'
        + '&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.'
        + 'GlobalIdentity&select=ID,StatusCode as StatusCode,RemindedDate as RemindedDate,'
        + 'ReminderNumber as ReminderNumber,DueDate as DueDate,ReminderFee as ReminderFee,'
        + 'User.DisplayName as CreatedBy&orderby=ID desc&filter=customerinvoiceid%20eq%20';

    constructor(
        private router: Router,
        private numberFormat: NumberFormat,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService
    ) {

        this.setupReminderTable();
    }

    public ngOnInit() {
        this.updateReminderTable();
    }

    private updateReminderTable() {
        this.statisticsService.GetAll(this.reminderQuery + this.customerInvoice.ID)
            .map(x => x.Data)
                .subscribe((reminders) => {
                    this.reminderList = reminders;
                    this.sumFee = this.reminderList.length > 0
                        ? this.reminderList.map(r => r.ReminderFee).reduce((a, b) => a + b)
                        : 0;
                }, (err) => this.errorService.handle(err));
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

        const feeAmountCol = new UniTableColumn('ReminderFee', 'Gebyr', UniTableColumnType.Number)
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
