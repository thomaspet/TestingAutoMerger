import {Component, Input, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {SendEmail} from '../../../../models/sendEmail';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {ISummaryConfig} from '../../../common/summary/summary';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {
    NumberFormat,
    StatisticsService,
    ErrorService,
    CustomerInvoiceReminderService
} from '../../../../services/services';

declare const moment;
declare const _;

@Component({
    selector: 'debtcollector-sending',
    template: `
      <uni-toolbar *ngIf="!modalMode" [config]="toolbarconfig"
                                      [saveactions]="saveactions">
      </uni-toolbar>

      <section [ngClass]="{'application': !modalMode}">
              <section *ngIf="remindersToDebtCollect">
                      <b>{{remindersToDebtCollect.length}} purringer er klar til inkasso</b><br/>
                      <uni-table [resource]="remindersToDebtCollect"
                                 [config]="reminderToDebtCollectTable"
                                 (rowSelectionChanged)="onRowSelected($event)"
                                 (rowSelected)="onRowSelected($event)">
                      </uni-table>
                      <uni-summary *ngIf="summaryData" [configs]="summary" [ngClass]="{'-is-dirty':dirty}"></uni-summary>
              </section>
      </section>
      <uni-confirm-modal></uni-confirm-modal>
      <report-preview-modal></report-preview-modal>
    `
})

export class DebtCollection implements OnInit {
    @Input() public config: any;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(UniConfirmModal) private confirmModal: UniConfirmModal;

    private remindersToDebtCollect: any;

    private remindersAll: any;
    private reminderToDebtCollectTable: UniTableConfig;
    private reminderQuery = 'model=CustomerInvoiceReminder&select=max(ID) as ID,max(ReminderNumber) as ReminderNumber,CustomerInvoice.InvoiceNumber as InvoiceNumber,CustomerInvoice.ID as InvoiceID,Customer.CustomerNumber as CustomerNumber,CustomerInvoice.CustomerName as CustomerName,CustomerInvoice.InvoiceDate as InvoiceDate,max(CustomerInvoiceReminder.RemindedDate) as RemindedDate,max(CustomerInvoiceReminder.DueDate) as PaymentDueDate,CustomerInvoice.CustomerID as CustomerID,CustomerInvoice.RestAmount as RestAmount,CustomerInvoice.TaxInclusiveAmount as TaxInclusiveAmount&expand=CustomerInvoice,CustomerInvoice.Customer.Info.DefaultEmail&filter=';

   private summary: ISummaryConfig[] = [];
    private summaryData = {
        SumReadyForDebtCollection: 0,
        SumChecked: 0
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
        private reminderService: CustomerInvoiceReminderService,
        private numberFormatService: NumberFormat,
    ) {
    }

    public ngOnInit() {
        this.setupRemindersToDebtCollectTable();
    }

    private onRowSelected(data) {
        this.summaryData.SumChecked = 0;
        let selectedRows = this.table.getSelectedRows();

        selectedRows.forEach(x => {
            this.summaryData.SumChecked += x.TaxInclusiveAmount;
        });
        this.setSums();
    }

    private sendRemindersToDebtCollect(donehandler: (string) => any): void {
        this.confirmModal.confirm(
            'Vil du sende merkede fakturaer til inkasso ?',
            'Til inkasso?',
            false,
            {accept: 'Ja', reject: 'Avbryt'}
        )
        .then((response: ConfirmActions) => {
            if (response === ConfirmActions.ACCEPT) {
                let selectedToDebtCollect = this.table.getSelectedRows().map(x => x.InvoiceID);
                this.reminderService.sendToDebtCollection(selectedToDebtCollect).subscribe(s => {
                    this.toastService.addToast('Inkasso', ToastType.good, 5,'Merkede fakturaer ble sendt til inkasso!');
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
        this.summary = [{
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumReadyForDebtCollection) : null,
                title: 'Totalt beløp til inkasso',
            }, {
                value: this.summaryData ? this.numberFormatService.asMoney(this.summaryData.SumChecked) : null,
                title: 'Totalt beløp avkryssede purringer til inkasso',
            }
        ];
    }

    public updateRemindersToDebtCollectionList(reminders) {
        let filter = reminders.map((r) => 'CustomerInvoiceID eq ' + r.ID).join(' or ');
        if(reminders.length > 0) {
        this.statisticsService.GetAll(this.reminderQuery + filter)
            .subscribe((data) => {
                this.remindersToDebtCollect = data.Data;
                this.summaryData.SumReadyForDebtCollection = _.sumBy(this.remindersToDebtCollect, x => x.TaxInclusiveAmount);
                this.summaryData.SumChecked = 0;
                this.setSums();
            });
        } else {
            this.remindersToDebtCollect = [];
            this.summaryData.SumReadyForDebtCollection = 0;
            this.summaryData.SumChecked = 0;
            this.setSums();
        }
    }

    private setupRemindersToDebtCollectTable() {

        this.reminderService.getCustomerInvoicesReadyForDebtCollection().subscribe((reminders) => {
            this.updateRemindersToDebtCollectionList(reminders)
        });

        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text).setWidth('100px').setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text).setWidth('100px').setFilterOperator('contains');

        invoiceNumberCol.setTemplate((reminders) => {
            return `<a href='/#/sales/invoices/${reminders.InvoiceID}'>${reminders.InvoiceNumber}</a>`;
        });

        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text).setFilterOperator('contains');
        customerNameCol.setTemplate((reminders) => {
            return `<a href='/#/sales/customer/${reminders.CustomerID}'>${reminders.CustomerNumber} - ${reminders.CustomerName}</a>`;
        })

        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.DateTime).setWidth('120px').setFilterOperator('contains');
        let remindedDateCol = new UniTableColumn('RemindedDate', 'Purredato', UniTableColumnType.DateTime).setWidth('120px').setFilterOperator('contains');
        let invoiceDueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.DateTime).setWidth('120px').setFilterOperator('contains');
        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Fakturabeløp', UniTableColumnType.Number)
            .setWidth('120px')
            .setFilterOperator('eq')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        this.reminderToDebtCollectTable = new UniTableConfig(false, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([reminderNumberCol, invoiceNumberCol, customerNameCol, taxInclusiveAmountCol, invoiceDateCol, remindedDateCol, invoiceDueDateCol]);
    }
}