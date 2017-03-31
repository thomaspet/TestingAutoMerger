import {Component, ViewChild} from '@angular/core';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, ITableFilter, IContextMenuItem} from 'unitable-ng2/main';
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
    ErrorService
} from '../../../../services/services';

import * as moment from 'moment';
declare const _;

@Component({
    selector: 'reminder-list',
    templateUrl: './reminderList.html'
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
    public showInvoicesWithReminderStop: boolean = false;

    private toolbarconfig: IToolbarConfig = {
        title: 'Purring',
        omitFinalCrumb: true
    };

    private summaryFields: ISummaryConfig[] = [];
    private summaryData = {
        restSumInvoicesToRemind: 0,
        restSumChecked: 0,
        SumFee: 0,
    };

    constructor(
        private router: Router,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private toastService: ToastService
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

        var selectedRows = this.table.getSelectedRows();
        var selectedHasReminderStopp = false;
        selectedRows.forEach(x => {
            if (x.DontSendReminders) {
                selectedHasReminderStopp = true;
                return;
            }
        });

        if (selectedHasReminderStopp) {
            this.toastService.addToast(
                'Rader med purrestopp er valgt',
                ToastType.bad,
                10,
                'Vennligst opphev purrestopp på faktura du vil kjøre purring for'
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

    public onToggleReminderStop() {

    }

    public settings(done) {
        this.settingsModal.settings().then((action) => {
            done();
        });
    }

    private onRowSelected(data) {
        this.summaryData.restSumChecked = 0;
        this.summaryData.SumFee = 0;

        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.restSumChecked += x.RestAmount;
            this.summaryData.SumFee += x.Fee;
        });

        this.setSums();
    }

    private setSums() {
        this.summaryFields = [{
            value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.restSumInvoicesToRemind) : null,
            title: 'Totalt restsum',
        }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.restSumChecked) : null,
                title: 'Totalt restsum valgt',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumFee) : null,
                title: 'Totalt gebyr valgt',
            }
        ];
    }

    public updateReminderTable(init: boolean = false) {
        this.customerInvoiceReminderService.getCustomerInvoicesReadyForReminding(this.showInvoicesWithReminderStop).subscribe((invoicesAndReminderslist) => {
            this.reminderList = invoicesAndReminderslist;
            if (init) {
                this.reminderList = this.reminderList.map((r) => {
                    r._rowSelected = true;
                    return r;
                });
            }
            this.summaryData.restSumInvoicesToRemind = _.sumBy(this.reminderList, x => x.RestAmount);
            this.setSums();
        }, (err) => this.errorService.handle(err));
    }

    private setupReminderTable() {
        this.updateReminderTable();

        // Define columns to use in the table
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text, false)
            .setWidth('100px').setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text, false)
            .setWidth('100px').setFilterOperator('contains')
            .setTemplate((reminder) => {
                return reminder.CustomerInvoiceID ? `<a href='/#/sales/invoices/${reminder.CustomerInvoiceID}'>${reminder.InvoiceNumber}</a>` : ``;
            });
        let customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text, false)
            .setWidth('100px').setFilterOperator('startswith')
            .setTemplate((reminder) => {
                return reminder.CustomerID ? `<a href='/#/sales/customer/${reminder.CustomerID}'>${reminder.CustomerNumber}</a>` : ``;
            });
        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setTemplate((reminder) => {
                return reminder.CustomerID ? `<a href='/#/sales/customer/${reminder.CustomerID}'>${reminder.CustomerName}</a>` : ``;
            });
        let emailCol = new UniTableColumn('EmailAddress', 'Epost', UniTableColumnType.Text, true)
            .setFilterOperator('contains');

        var currencyCodeCol = new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setWidth('5%');

        var taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number, false)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        var restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        var feeAmountCol = new UniTableColumn('Fee', 'Gebyr', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });
        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Opprettet', UniTableColumnType.LocalDate, false)
            .setWidth('8%').setFilterOperator('eq');
        let dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate, true)
            .setWidth('8%').setFilterOperator('eq');

        var reminderStoppCol = new UniTableColumn('DontSendReminders', 'Purrestopp').setTemplate((item) => {
            return item.DontSendReminders ? 'Ja' : 'Nei';
        });

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Inverter purrestopp',
            action: (rowModel) => {
                const warnToastID = this.toastService.addToast('Purrestopp', ToastType.warn);
                this.customerInvoiceService.ActionWithBody(rowModel.CustomerInvoiceID, rowModel, 'toggle-reminder-stop').subscribe(() => {
                    this.toastService.removeToast(warnToastID);
                    this.toastService.addToast('Purrestopp invertert', ToastType.good, 10);
                    this.updateReminderTable();
                },
                    (err) => {
                        this.toastService.removeToast(warnToastID);
                        this.errorService.handle(err);
                    });
            }
        });

        // Setup table
        this.reminderTable = new UniTableConfig(true, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setAutoAddNewRow(false)
            //.setFilters(this.defaultTableFilter()) // TODO: later on
            .setColumns([reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol, emailCol, currencyCodeCol,
                taxInclusiveAmountCurrencyCol, restAmountCurrencyCol, feeAmountCol, invoiceDateCol, dueDateCol, reminderStoppCol])
            .setContextMenu(contextMenuItems);
    }
}
