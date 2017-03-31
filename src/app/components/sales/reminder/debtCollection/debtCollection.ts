import {Component, Input, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType, IContextMenuItem} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {SendEmail} from '../../../../models/sendEmail';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    NumberFormat,
    CustomerInvoiceService,
    StatisticsService,
    ErrorService,
    CustomerInvoiceReminderService
} from '../../../../services/services';

import * as moment from 'moment';
declare const _;

@Component({
    selector: 'debtcollector-sending',
    templateUrl: './debtCollection.html'
})

export class DebtCollection implements OnInit {
    @Input() public config: any;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private remindersToDebtCollect: any;

    private remindersAll: any;
    private reminderToDebtCollectTable: UniTableConfig;

    private showInvoicesWithReminderStop: boolean = false;

    private summaryFields: ISummaryConfig[] = [];
    private summaryData = {
        restSumReadyForDebtCollection: 0,
        restSumChecked: 0
    };


    private toolbarconfig: IToolbarConfig = {
        title: 'Inkasso',
    };

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Send purringer til inkasso',
            action: (done) => this.sendRemindersToDebtCollect(done),
            disabled: !!this.remindersToDebtCollect
        }
    ];

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceService: CustomerInvoiceService,
        private numberFormatService: NumberFormat
    ) {
    }

    public ngOnInit() {
        this.setupRemindersToDebtCollectTable();
    }

    private onRowSelected(data) {
        this.summaryData.restSumChecked = 0;
        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.restSumChecked += x.RestAmount;
        });
        this.setSums();
    }

    private sendRemindersToDebtCollect(donehandler: (string) => any): void {
        var selected = this.table.getSelectedRows().map((ci) => ci.CustomerInvoiceID);
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil sende til inkasso'
            );

            donehandler('Kjøring avbrutt');
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
                'Vennligst opphev purrestopp på faktura du vil sende til inkasso'
            );

            donehandler('Kjøring avbrutt');
            return;
        }

        this.confirmModal.confirm(
            'Vil du sende merkede fakturaer til inkasso ?',
            'Til inkasso?',
            false,
            { accept: 'Ja', reject: 'Avbryt' }
        )
            .then((response: ConfirmActions) => {
                if (response === ConfirmActions.ACCEPT) {
                    let selectedToDebtCollect = this.table.getSelectedRows().map(x => x.CustomerInvoiceID);
                    this.customerInvoiceReminderService.sendToDebtCollection(selectedToDebtCollect).subscribe(s => {
                        this.toastService.addToast('Inkasso', ToastType.good, 5, 'Merkede fakturaer ble sendt til inkasso!');
                        this.setupRemindersToDebtCollectTable();
                        donehandler('Merkede fakturaer ble sendt til inkasso!');
                    }, err => {
                        this.errorService.handle(err);
                        donehandler('En feil oppstod ved sending av fakturaer til inkasso!');
                    });
                }
            });
    }

    private setSums() {
        this.summaryFields = [{
            value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.restSumReadyForDebtCollection) : null,
            title: 'Totalt restsum til inkasso',
        }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.restSumChecked) : null,
                title: 'Totalt restsum valgt',
            }
        ];
    }

    public updateReminderTable() {
        this.customerInvoiceReminderService.getCustomerInvoicesReadyForDebtCollection(this.showInvoicesWithReminderStop).subscribe((reminders) => {
            if (reminders.length > 0) {
                this.remindersToDebtCollect = reminders;
                this.summaryData.restSumReadyForDebtCollection = _.sumBy(this.remindersToDebtCollect, x => x.RestAmount);
                this.summaryData.restSumChecked = 0;
                this.setSums();
            } else {
                this.remindersToDebtCollect = [];
                this.summaryData.restSumReadyForDebtCollection = 0;
                this.summaryData.restSumChecked = 0;
                this.setSums();
            }
        }, (err) => this.errorService.handle(err));
    }


    private setupRemindersToDebtCollectTable() {
        this.updateReminderTable();

        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text).setWidth('100px').setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text).setWidth('100px').setFilterOperator('contains');

        invoiceNumberCol.setTemplate((reminders) => {
            return `<a href='/#/sales/invoices/${reminders.CustomerInvoiceID}'>${reminders.InvoiceNumber}</a>`;
        });

        let customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text, false)
            .setWidth('100px').setFilterOperator('startswith')
            .setTemplate((reminder) => {
                return reminder.CustomerID ? `<a href='/#/sales/customer/${reminder.CustomerID}'>${reminder.CustomerNumber}</a>` : ``;
            });

        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text).setFilterOperator('contains');
        customerNameCol.setTemplate((reminders) => {
            return `<a href='/#/sales/customer/${reminders.CustomerID}'>${reminders.CustomerNumber} - ${reminders.CustomerName}</a>`;
        })

        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.DateTime).setWidth('120px').setFilterOperator('contains');
        let invoiceDueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.DateTime).setWidth('120px').setFilterOperator('contains');

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

        this.reminderToDebtCollectTable = new UniTableConfig(false, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol, currencyCodeCol, 
                taxInclusiveAmountCurrencyCol, restAmountCurrencyCol, invoiceDateCol, invoiceDueDateCol, reminderStoppCol])
            .setContextMenu(contextMenuItems);
    }
}