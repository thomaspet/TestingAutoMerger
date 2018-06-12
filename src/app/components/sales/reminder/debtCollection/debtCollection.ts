import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {
    NumberFormat,
    CustomerInvoiceService,
    StatisticsService,
    ErrorService,
    CustomerInvoiceReminderService
} from '../../../../services/services';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    IContextMenuItem
} from '../../../../../framework/ui/unitable/index';

declare const _;

@Component({
    selector: 'debtcollector-sending',
    templateUrl: './debtCollection.html'
})

export class DebtCollection implements OnInit {
    @Input()
    public config: any;

    @ViewChild(UniTable)
    private table: UniTable;

    public remindersToDebtCollect: any;

    public remindersAll: any;
    public reminderToDebtCollectTable: UniTableConfig;

    private showInvoicesWithReminderStop: boolean = false;

    public summaryFields: ISummaryConfig[] = [];
    public summaryData: any = {
        restSumReadyForDebtCollection: 0,
        restSumChecked: 0
    };


    public toolbarconfig: IToolbarConfig = {
        title: 'Inkasso',
    };

    public saveactions: IUniSaveAction[] = [
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
        private numberFormatService: NumberFormat,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.setupRemindersToDebtCollectTable();
    }

    public onRowSelected(data) {
        this.summaryData.restSumChecked = 0;
        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.restSumChecked += x.RestAmount;
        });
        this.setSums();
    }

    private sendRemindersToDebtCollect(donehandler: (str: string) => any): void {
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

        this.modalService.confirm({
            header: 'Til inkasso',
            message: 'Vennligst bekreft sending av markerte fakturaer til inkasso',
            buttonLabels: {
                accept: 'Send',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                let selectedToDebtCollect = this.table.getSelectedRows().map(x => x.CustomerInvoiceID);
                this.customerInvoiceReminderService.sendToDebtCollection(selectedToDebtCollect).subscribe(s => {
                    this.toastService.addToast(
                        'Inkasso', ToastType.good, 5, 'Merkede fakturaer ble sendt til inkasso'
                    );
                    this.setupRemindersToDebtCollectTable();
                    donehandler('Merkede fakturaer sendt til inkasso');
                }, err => {
                    this.errorService.handle(err);
                    donehandler('En feil oppsto ved sending til inkasso');
                });
            }
        });
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
        this.customerInvoiceReminderService.getCustomerInvoicesReadyForDebtCollection(
            this.showInvoicesWithReminderStop
        ).subscribe((reminders) => {
            if (reminders.length > 0) {
                this.remindersToDebtCollect = reminders;
                this.summaryData.restSumReadyForDebtCollection = _.sumBy(
                    this.remindersToDebtCollect, x => x.RestAmount
                );
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

        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr')
            .setWidth('100px')
            .setFilterOperator('contains');

        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setWidth('100px')
            .setFilterOperator('contains')
            .setLinkResolver(row => `/sales/invoices/${row.CustomerInvoiceID}`);

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text, false)
            .setWidth('100px')
            .setFilterOperator('startswith')
            .setLinkResolver(row => `/sales/customer/${row.CustomerID}`);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde')
            .setFilterOperator('contains')
            .setLinkResolver(row => `/sales/customer/${row.CustomerID}`);

        const invoiceDateCol = new UniTableColumn('InvoiceDate', 'Dato', UniTableColumnType.DateTime)
            .setWidth('120px')
            .setFilterOperator('contains');

        const invoiceDueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.DateTime)
            .setWidth('120px')
            .setFilterOperator('contains');

        const currencyCodeCol = new UniTableColumn('CurrencyCodeCode', 'Valuta', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setWidth('5%');

        const taxInclusiveAmountCurrencyCol = new UniTableColumn(
            'TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number, false
        )
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
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
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const reminderStoppCol = new UniTableColumn('DontSendReminders', 'Purrestopp').setTemplate((item) => {
            return item.DontSendReminders ? 'Ja' : 'Nei';
        });

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
                invoiceDateCol, invoiceDueDateCol, reminderStoppCol
            ])
            .setContextMenu(contextMenuItems);
    }
}
