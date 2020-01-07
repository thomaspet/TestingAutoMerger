import {Component, ViewChild} from '@angular/core';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {UniModalService} from '../../../../../framework/uni-modal';
import {UniReminderSettingsModal} from '../../../common/reminder/settings/reminderSettingsModal';
import {CustomerInvoiceReminderSettings, LocalDate} from '../../../../unientities';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig,
    ITableFilter,
    IContextMenuItem,
    INumberFormat
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    NumberFormat,
    CustomerInvoiceService,
    CustomerInvoiceReminderService,
    CustomerInvoiceReminderSettingsService,
    ErrorService
} from '../../../../services/services';

declare const _;

@Component({
    selector: 'reminder-list',
    templateUrl: './reminderList.html'
})
export class ReminderList {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;

    public reminderTable: UniTableConfig;
    public reminderList: any;
    public saveActions: IUniSaveAction[] = [];
    private reminderSettings: CustomerInvoiceReminderSettings;
    public showInvoicesWithReminderStop: boolean = false;

    public toolbarconfig: IToolbarConfig = {
        title: 'Klar til purring',
        omitFinalCrumb: true
    };

    public summaryFields: ISummaryConfig[] = [];
    public summaryData: any = {
        restSumInvoicesToRemind: 0,
        restSumChecked: 0,
        SumFee: 0,
    };

    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 2
    };

    constructor(
        private router: Router,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceReminderSettingsService: CustomerInvoiceReminderSettingsService,
        private customerInvoiceService: CustomerInvoiceService,
        private tabService: TabService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private toastService: ToastService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Purring',
            url: '/sales/reminders/ready',
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
        const selected = this.table.getSelectedRows().map((ci) => ci.CustomerInvoiceID);
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

        const selectedRows = this.table.getSelectedRows();
        let selectedHasReminderStopp = false;
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

        const method = this.reminderList.length === selected.length ?
            this.customerInvoiceReminderService.createInvoiceRemindersFromReminderRules() :
            this.customerInvoiceReminderService.createInvoiceRemindersForInvoicelist(selected);

        method.subscribe((reminders) => {
            let filter = '';
            if (reminders && reminders.length > 0)
            {
                filter = '?runNumber=' + reminders[0].RunNumber
            }
            this.router.navigateByUrl('/sales/reminders/reminded' + filter);
            /*
            TODO:   discarded modal view of sending av printing,
            completely remove modal view if BA approves of this simplified prosess
                    Using
            this.reminderSendingModal.confirm(reminders).then((action) => {
                this.updateReminderTable();
            });
            */
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
        this.modalService.open(UniReminderSettingsModal)
            .onClose.subscribe(() => done());
    }

    public onRowSelectionChange(selectedRows) {
        this.summaryData.restSumChecked = 0;
        this.summaryData.SumFee = 0;

        (selectedRows || []).forEach(x => {
            this.summaryData.restSumChecked += x.RestAmount;
            this.summaryData.SumFee += x.Fee;
        });

        this.setSums();
    }

    private setSums() {
        this.summaryFields = [{
            value: this.summaryData
                ? this.numberFormatService.asMoney(this.summaryData.restSumInvoicesToRemind)
                : null,
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
        this.customerInvoiceReminderService.getCustomerInvoicesReadyForReminding(
            this.showInvoicesWithReminderStop
        ).subscribe((invoicesAndReminderslist) => {
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
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text, false)
            .setWidth('100px').setFilterOperator('contains');
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text, false)
            .setWidth('100px')
            .setFilterOperator('contains')
            .setLinkResolver(reminder => `/sales/invoices/${reminder.CustomerInvoiceID}`);
        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text, false)
            .setWidth('100px')
            .setFilterOperator('startswith')
            .setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`);
        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`).setWidth('15%');
        const emailCol = new UniTableColumn('EmailAddress', 'Epost', UniTableColumnType.Text, true)
            .setFilterOperator('contains').setWidth('15%');

        const currencyCodeCol = new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setWidth('5%');

        const taxInclusiveAmountCurrencyCol = new UniTableColumn(
            'TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number, false
        )
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const restAmountCurrencyCol = new UniTableColumn(
                'RestAmountCurrency', 'Restsum', UniTableColumnType.Number, false
            )
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const feeAmountCol = new UniTableColumn('Fee', 'Gebyr', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const interestAmountCol = new UniTableColumn('Interest', 'Renter', UniTableColumnType.Number, false)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setVisible(false)

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Opprettet', UniTableColumnType.LocalDate, false)
            .setWidth('8%').setFilterOperator('eq');
        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate, true)
            .setWidth('8%').setFilterOperator('eq');

        const reminderStoppCol = new UniTableColumn('DontSendReminders', 'Purrestopp').setTemplate((item) => {
            return item.DontSendReminders ? 'Ja' : 'Nei';
        });

        const externalRefCol = new UniTableColumn('ExternalReference', 'Fakturaliste', UniTableColumnType.Text, false)
        .setFilterOperator('contains')
        .setVisible(false);

        // Context menu
        const contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Sett purrestopp',
            action: (rowModel) => {
                const warnToastID = this.toastService.addToast('Purrestopp', ToastType.warn);
                this.customerInvoiceService.ActionWithBody(
                    rowModel.CustomerInvoiceID, rowModel, 'toggle-reminder-stop'
                ).subscribe(() => {
                    this.toastService.removeToast(warnToastID);
                    this.toastService.addToast('Purrestoppet', ToastType.good, 10);
                    this.updateReminderTable();
                },
                    (err) => {
                        this.toastService.removeToast(warnToastID);
                        this.errorService.handle(err);
                    });
            },
            disabled: (item) =>  item.DontSendReminders
        });

        contextMenuItems.push({
            label: 'Opphev purrestopp',
            action: (rowModel) => {
                const warnToastID = this.toastService.addToast('Purrestopp', ToastType.warn);
                this.customerInvoiceService.ActionWithBody(
                    rowModel.CustomerInvoiceID, rowModel, 'toggle-reminder-stop'
                ).subscribe(() => {
                    this.toastService.removeToast(warnToastID);
                    this.toastService.addToast('Purrestopp opphevet', ToastType.good, 10);
                    this.updateReminderTable();
                },
                    (err) => {
                        this.toastService.removeToast(warnToastID);
                        this.errorService.handle(err);
                    });
            },
            disabled: (item) =>  !item.DontSendReminders
        });

        // Setup table
        this.reminderTable = new UniTableConfig('sales.reminders.reminderList', true, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setAutoAddNewRow(false)
            .setSearchListVisible(true)
            .setEditable(false)
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol, emailCol,
                currencyCodeCol, taxInclusiveAmountCurrencyCol, restAmountCurrencyCol,
                feeAmountCol, interestAmountCol, invoiceDateCol, dueDateCol, reminderStoppCol, externalRefCol
            ])
            .setContextMenu(contextMenuItems);
    }
}
