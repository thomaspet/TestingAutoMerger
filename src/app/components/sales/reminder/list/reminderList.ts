import {Component, ViewChild} from '@angular/core';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {UniModalService} from '../../../../../framework/uni-modal';
import {UniReminderSettingsModal} from '../../../common/reminder/settings/reminderSettingsModal';
import { UniReminderSendingModal } from '../sending/reminderSendingModal';
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
    @ViewChild(AgGridWrapper, { static: true }) private table: AgGridWrapper;

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
            label: 'Kjør og send purringer',
            action: (done) => this.run(done),
            disabled: false
        });

        this.saveActions.push({
            label: 'Oppdater liste',
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
            this.reload(done);

            if (reminders && reminders.length > 0) {
                this.modalService.open(UniReminderSendingModal, {
                    data: {
                        reminders: reminders.map(x => x.ID)
                    }
                })
                .onClose.subscribe(res => {
                    if (!res) {
                        return;
                    }

                    this.toastService.addToast(`Purring${reminders.length > 1 ? 'er' : ''} sendes`, ToastType.good, ToastTime.short);
                });
            }
        });
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
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr')
            .setWidth('100px');
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setWidth('100px')
            .setLinkResolver(reminder => `/sales/invoices/${reminder.CustomerInvoiceID}`);
        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr')
            .setWidth('100px')
            .setFilterOperator('startswith')
            .setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde');
        const emailCol = new UniTableColumn('EmailAddress', 'Epost');
        const currencyCodeCol = new UniTableColumn('CurrencyCodeCode', 'Valuta');

        const taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const feeAmountCol = new UniTableColumn('Fee', 'Gebyr', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const interestAmountCol = new UniTableColumn('Interest', 'Renter', UniTableColumnType.Number)
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setVisible(false);

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Opprettet', UniTableColumnType.LocalDate);
        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);

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
        this.reminderTable = new UniTableConfig('sales.reminders.reminderList', false, true, 25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol, emailCol,
                currencyCodeCol, taxInclusiveAmountCurrencyCol, restAmountCurrencyCol,
                feeAmountCol, interestAmountCol, invoiceDateCol, dueDateCol, reminderStoppCol, externalRefCol
            ])
            .setContextMenu(contextMenuItems);
    }
}
