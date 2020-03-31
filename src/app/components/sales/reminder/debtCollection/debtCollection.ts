import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ToastService, ToastType } from '../../../../../framework/uniToast/toastService';
import { IToolbarConfig } from './../../../common/toolbar/toolbar';
import { IUniSaveAction } from '../../../../../framework/save/save';
import { ISummaryConfig } from '../../../common/summary/summary';
import { UniModalService, ConfirmActions } from '../../../../../framework/uni-modal';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    NumberFormat,
    CustomerInvoiceService,
    ErrorService,
    CustomerInvoiceReminderService,
    ElsaPurchaseService,
    ReportDefinitionService
} from '../../../../services/services';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    IContextMenuItem,
    INumberFormat
} from '../../../../../framework/ui/unitable/index';
import { TabService, UniModules } from '../../../layout/navbar/tabstrip/tabService';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UniPreviewModal } from '@app/components/reports/modals/preview/previewModal';

declare const _;

@Component({
    selector: 'debtcollector-sending',
    templateUrl: './debtCollection.html'
})

export class DebtCollection implements OnInit {
    @Input()
    public config: any;

    @ViewChild(AgGridWrapper, { static: false })
    private table: AgGridWrapper;

    public remindersToDebtCollect: any;
    public remindersAll: any;
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
        title: 'Klar til inkasso',
        omitFinalCrumb: true
    };

    public saveactions: IUniSaveAction[] = [
        {
            label: 'Send purringer til inkasso',
            action: (done) => this.debtCollectionProductPurchased ?
                this.showProductPurchaseToast(done) : this.sendRemindersToDebtCollect(done),
            disabled: !!this.remindersToDebtCollect
        }
    ];

    debtCollectionProductPurchased = false;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private customerInvoiceReminderService: CustomerInvoiceReminderService,
        private customerInvoiceService: CustomerInvoiceService,
        private numberFormatService: NumberFormat,
        private modalService: UniModalService,
        private tabService: TabService,
        private elsaPurchaseService: ElsaPurchaseService,
        private reportDefinitionService: ReportDefinitionService
    ) { }

    public ngOnInit() {
        this.setupRemindersToDebtCollectTable();
        this.tabService.addTab({
            name: 'Purring',
            url: 'sales/reminders/debtcollect',
            moduleID: UniModules.Reminders,
            active: true
        });


        this.elsaPurchaseService.getPurchaseByProductName('Kreditorforeningen')
            .pipe(catchError(() => of(null)))
            .subscribe(product => {
                this.debtCollectionProductPurchased = !!product;
            });
    }

    public onRowSelected(data) {
        this.summaryData.restSumChecked = 0;
        const selectedRows = data;

        selectedRows.forEach(x => {
            this.summaryData.restSumChecked += x.RestAmount;
        });
        this.setSums();
    }

    private sendRemindersToDebtCollect(donehandler: (str: string) => any): void {
        const selected = this.table.getSelectedRows().map((ci) => ci.CustomerInvoiceID);
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
                const selectedForDebtCollectionQueue = this.table.getSelectedRows().map(x => x.CustomerInvoiceID);
                this.customerInvoiceReminderService.queueForDebtCollection(selectedForDebtCollectionQueue).subscribe(s => {
                    this.toastService.addToast(
                        'Inkasso', ToastType.good, 5, 'Merkede fakturaer ble sendt til inkasso'
                    );
                    this.setupRemindersToDebtCollectTable();
                    donehandler('Merkede fakturaer sendt til inkasso');
                }, err => {
                    this.errorService.handle(err);
                    donehandler('En feil oppstod ved sending til inkasso');
                });
            } else if (response === ConfirmActions.CANCEL) {
                donehandler('Sending til inkasso ble avbrutt');
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
            disabled: (item) => item.DontSendReminders
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
            disabled: (item) => !item.DontSendReminders
        });

        contextMenuItems.push({
            label: 'Forhåndsvis',
            action: (rowModel) => {
                this.openReport(rowModel);
            }
        });

        const configStoreKey = 'sales.reminders.reminderToDebtCollect';
        this.reminderToDebtCollectTable = new UniTableConfig(configStoreKey, false, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol,
                currencyCodeCol, taxInclusiveAmountCurrencyCol, restAmountCurrencyCol,
                invoiceDateCol, invoiceDueDateCol, reminderStoppCol, externalRefCol
            ])
            .setContextMenu(contextMenuItems);
    }

    showProductPurchaseToast(done) {
        this.toastService.addToast('Standard purrefunksjonalitet deaktivert',
            ToastType.info,
            10,
            'Du har en aktiv integrasjon for purring/inkasso. Standardfunksjonaliteten for disse funksjonene er derfor deaktivert.');

        done();
    }

    private openReport(reminder: any) {
        this.reportDefinitionService
            .getReportByName('Purring')
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((report) => {
                report.parameters = [
                    {
                        Name: 'CustomerInvoiceID',
                        value: reminder.CustomerInvoiceID
                    },
                    {
                        Name: 'ReminderNumber',
                        value: reminder.ReminderNumber
                    },
                    {
                        Name: 'ReminderFilter',
                        value: '0 eq 1'
                    }
                ];

                this.modalService.open(UniPreviewModal, {
                    data: report
                });
        });
    }
}
