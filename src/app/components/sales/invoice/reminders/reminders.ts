import {Component, Input} from '@angular/core';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
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

import * as moment from 'moment';
declare const _;

@Component({
    selector: 'invoice-reminders',
    templateUrl: './reminders.html'
})
export class InvoiceReminders {
    @Input()
    private customerInvoice: CustomerInvoice;

    private reminderTable: UniTableConfig;
    private reminderList: any;
    private sumFee: number = 0;

    private reminderQuery = 'model=CustomerInvoiceReminder&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity&select=ID,StatusCode as StatusCode,RemindedDate as RemindedDate,ReminderNumber as ReminderNumber,DueDate as DueDate,ReminderFee as ReminderFee,User.DisplayName as CreatedBy&orderby=ID desc&filter=customerinvoiceid%20eq%20';

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
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr.', UniTableColumnType.Text);
        let remindedDateCol = new UniTableColumn('RemindedDate', 'Purredato', UniTableColumnType.LocalDate);
        let dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);
        let createdByCol = new UniTableColumn('CreatedBy', 'Opprettet av', UniTableColumnType.Text);
        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setTemplate((reminder) => {
                return this.customerInvoiceReminderService.getStatusText(reminder.StatusCode);
            });

        var feeAmountCol = new UniTableColumn('ReminderFee', 'Gebyr', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        // Setup table
        this.reminderTable = new UniTableConfig(false, true, 4)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setDeleteButton(false)
            .setAutoAddNewRow(false)
            .setColumns([reminderNumberCol, createdByCol, feeAmountCol, remindedDateCol, dueDateCol, statusCol]);
    }
}
