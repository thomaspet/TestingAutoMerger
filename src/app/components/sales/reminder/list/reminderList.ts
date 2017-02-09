import {Component, ViewChild} from '@angular/core';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, ITableFilter} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ReminderSendingModal} from '../sending/reminderSendingModal';
import {ReminderSettingsModal} from '../../../common/reminder/settings/settingsModal';
import {Observable} from 'rxjs/Observable';
import {
    CustomerInvoiceReminderSettings,
    CustomerInvoice,
    LocalDate
} from '../../../../unientities';

import {
    NumberFormat,
    CustomerInvoiceService,
    CustomerInvoiceReminderService,
    CustomerInvoiceReminderSettingsService,
    StatisticsService,
    ErrorService
} from '../../../../services/services';

declare const moment;
declare const _;

@Component({
    selector: 'reminder-list',
    templateUrl: 'app/components/sales/reminder/list/reminderList.html'
})
export class ReminderList {
    @ViewChild(UniTable)
    private table: UniTable;
    @ViewChild(ReminderSettingsModal)
    private settingsModal: ReminderSettingsModal;
    @ViewChild(ReminderSendingModal)
    private reminderSendingModal: ReminderSendingModal;

    private reminderTable: UniTableConfig;
    private reminderList: any;
    private saveActions: IUniSaveAction[] = [];
    private reminderSettings: CustomerInvoiceReminderSettings;

    private toolbarconfig: IToolbarConfig = {
        title: 'Purring',
        omitFinalCrumb: true
    };

    private summary: ISummaryConfig[] = [];
    private summaryData = {
        SumPayments: 0,
        SumChecked: 0,
        SumFee: 0,
    };

    private emailQuery = 'model=CustomerInvoice&select=ID as CustomerInvoiceID,DefaultEmail.EmailAddress as EmailAddress&expand=Customer.Info.DefaultEmail&filter=';

    constructor(
        private router: Router,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private toastService: ToastService,
        private statisticsService: StatisticsService
    ) {
        this.tabService.addTab({
            name: 'Purring',
            url: '/sales/reminders',
            moduleID: UniModules.Reminders,
            active: true
        });

        this.setupReminderTable();
    }

    public ngOnInit() {
        this.setSums();
        this.updateSaveActions();

        this.customerInvoiceReminderSettingsService.Get(1).subscribe((reminderSettings) => {
            this.reminderSettings = reminderSettings;
        });
    }

    private defaultTableFilter(): ITableFilter[] {
        const filters: ITableFilter[] = [];

        // Minimum amount to remind
        filters.push({
            field: 'RestAmount',
            operator: 'gt',
            value: this.reminderSettings.MinimumAmountToRemind,
            group: 0
        });

        // Due date
        filters.push({
            field: 'PaymentDueDate',
            operator: 'lt',
            value: new LocalDate().toString(),
            group: 0
        });

        return filters;
    }

    private updateSaveActions() {
        this.saveActions = [];

        this.saveActions.push({
            label: 'Kjør',
            action: (done) => this.run(done),
            disabled: false
        });

        this.saveActions.push({
            label: 'Oppdater',
            action: (done) => this.reload(done),
            disabled: false
        });

        this.saveActions.push({
            label: 'Innstillinger',
            action: (done) => this.settings(done),
            disabled: false
        });
    }

    public run(done) {
        var selected = this.table.getSelectedRows().map((ci) => ci.CustomerInvoiceID);
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil kjøre purring for, eller kryss av for alle'
            );

            done('Kjøring avbrutt');
            return;
        }

        var method = this.reminderList.length === selected.length ?
            this.customerInvoiceReminderService.createInvoiceRemindersFromReminderRules() :
            this.customerInvoiceReminderService.createInvoiceRemindersForInvoicelist(selected);

        method.subscribe((reminders) => {
            this.reminderSendingModal.confirm(reminders).then((action) => {
                this.updateReminderTable();
            });
        });

        done();
    }

    public reload(done) {
        this.updateReminderTable();

        done();
    }

    public settings(done) {
        this.settingsModal.settings().then((action) => {
            done();
        });
    }

    private onRowSelected(data) {
        this.summaryData.SumChecked = 0;
        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.SumChecked += x.TaxInclusiveAmount;
            this.summaryData.SumFee += x.Fee;
        });

        this.setSums();
    }

    private setSums() {
        this.summary = [{
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumPayments) : null,
                title: 'Totalt til betaling',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumChecked) : null,
                title: 'Totalt avkrysset',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumFee) : null,
                title: 'Totalt gebyr',
            }
        ];
    }

    private updateReminderTable() {
        this.customerInvoiceReminderService.getCustomerInvoicesReadyForReminding().subscribe((invoicelist) => {

            let invoiceIDs = invoicelist.map((ci) => ci.ID);
            let filter = invoiceIDs.map((id) => 'ID eq ' + id).join(' or ');

            Observable.forkJoin(
                this.customerInvoiceReminderService.getInvoiceRemindersForInvoicelist(invoiceIDs),
                this.statisticsService.GetAllUnwrapped(this.emailQuery + filter)
            ).subscribe((res) => {
                let reminders = res[0];
                let emails = res[1];

                this.reminderList = invoicelist.map((invoice: CustomerInvoice) => {
                    let reminder = reminders.find((r) => r.CustomerInvoiceID === invoice.ID);
                    let email = emails.find((e) => e.CustomerInvoiceID === invoice.ID);

                    return {
                        CustomerInvoiceID: invoice.ID,
                        ReminderNumber: reminder.ReminderNumber,
                        InvoiceID: invoice.ID,
                        InvoiceNumber: invoice.InvoiceNumber,
                        InvoiceDate: invoice.InvoiceDate,
                        CustomerID: invoice.CustomerID,
                        CustomerName: invoice.CustomerName,
                        PaymentDueDate: invoice.PaymentDueDate,
                        EmailAddress: email.EmailAddress,
                        TaxInclusiveAmount: invoice.TaxInclusiveAmount,
                        RestAmount: invoice.RestAmount,
                        Fee: reminder.ReminderFee
                    };
                });
            });
        }, (err) => this.errorService.handle(err));
    }

    private setupReminderTable() {
        this.updateReminderTable();

        // Define columns to use in the table
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text)
            .setWidth('15%').setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setWidth('15%').setFilterOperator('contains')
            .setTemplate((reminder) => {
                return `<a href='/#/sales/invoices/${reminder.InvoiceID}'>${reminder.InvoiceNumber}</a>`;
            });
        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setTemplate((reminder) => {
                return `<a href='/#/sales/customer/${reminder.CustomerID}'>${reminder.CustomerName}</a>`;
            });
        let dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');
        let emailCol = new UniTableColumn('EmailAddress', 'Epost', UniTableColumnType.Text)
            .setFilterOperator('contains');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        var restAmountCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        var feeAmountCol = new UniTableColumn('Fee', 'Gebyr', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        // Setup table
        this.reminderTable = new UniTableConfig(true, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setAutoAddNewRow(false)
            //.setFilters(this.defaultTableFilter()) // TODO: later on
            .setColumns([reminderNumberCol, invoiceNumberCol, customerNameCol, emailCol,
                         taxInclusiveAmountCol, restAmountCol, feeAmountCol, invoiceDateCol, dueDateCol]);
    }
}
