import {Component, Input, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {SendEmail} from '../../../../models/sendEmail';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService
} from '../../../../services/services';

declare const moment;

@Component({
    selector: 'reminder-sending',
    templateUrl: './reminderSending.html'
})
export class ReminderSending implements OnInit {
    @Input() public config: any;
    @Input() public modalMode: boolean;
    @ViewChildren(UniTable) private tables: QueryList<UniTable>;
    @ViewChild(PreviewModal) public previewModal: PreviewModal;

    private remindersEmail: any;
    private remindersPrint: any;
    private remindersAll: any;
    private reminderTable: UniTableConfig;
    private reminderQuery = 'model=CustomerInvoiceReminder&select=ID as ID,ReminderNumber as ReminderNumber,CustomerInvoice.InvoiceNumber as InvoiceNumber,CustomerInvoice.CustomerName as CustomerName,DefaultEmail.EmailAddress as EmailAddress,CustomerInvoice.RestAmount as RestAmount,CustomerInvoice.TaxInclusiveAmount as TaxInclusiveAmount&expand=CustomerInvoice,CustomerInvoice.Customer.Info.DefaultEmail&filter=';

    private toolbarconfig: IToolbarConfig = {
        title: 'Purringer',
    };

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Send og skriv ut valgte',
             action: (done) => this.sendReminders(done, false),
             main: true,
             disabled: !!this.remindersAll
         },
         {
             label: 'Skriv ut alle valgte',
             action: (done) => this.sendReminders(done, true),
             disabled: !!this.remindersAll
         }
    ];

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private reminderService: CustomerInvoiceReminderService,
        private reportDefinitionService: ReportDefinitionService
    ) {
    }

    public ngOnInit() {
        this.setupReminderTable();
    }

    private sendReminders(done, printonly) {
        var selected = this.getSelected();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil sende purringer for, eller kryss av for alle'
            );

            done('Sending avbrutt');
            return;
        }

        done('Purringer sendes');

        if (printonly) {
            this.sendPrint(true);
        } else {
            this.sendEmail();
            this.sendPrint(false);
        }
    }

    public updateReminderList(reminders) {
        let filter = reminders.map((r) => 'ID eq ' + r.ID).join(' or ');
        this.statisticsService.GetAll(this.reminderQuery + filter)
            .subscribe((data) => {
                this.remindersAll = data.Data;
                this.remindersAll = data.Data.map((r) => {
                    r._rowSelected = true;
                    return r;
                });
                this.remindersEmail = this.remindersAll.filter((r) => !!r.EmailAddress);
                this.remindersPrint = this.remindersAll.filter((r) => this.remindersEmail.indexOf(r) < 0);
            });
    }

    public getSelected() {
        var emails = this.tables.toArray()[0].getSelectedRows();
        var print = this.tables.toArray()[1].getSelectedRows();

        return emails.concat(print);
    }

    public getSelectedEmail() {
        return this.tables.toArray()[0].getSelectedRows();
    }

    public getSelectedPrint() {
        return this.tables.toArray()[1].getSelectedRows();
    }

    public sendEmail() {
        var emails = this.getSelectedEmail();
        if (emails.length === 0) { return; }

        emails.forEach((r) => {
            let email = new SendEmail();
            email.EmailAddress = r.EmailAddress;
            email.EntityType = 'CustomerInvoiceReminder';
            email.EntityID = r.ID;
            email.Subject = 'Purring ' + r.ReminderNumber;
            email.Message = 'Vedlagt finner du purring for faktura ' + r.InvoiceNumber;

            this.reportDefinitionService.generateReportSendEmail('Purring', email);
        });
    }

    public sendPrint(all) {
        var prints = all ? this.getSelected() : this.getSelectedPrint();
        if (prints.length === 0) { return; }

        this.reportDefinitionService.getReportByName('Purring').subscribe((report) => {
            if (report) {
                console.log('print', prints);
                let filter = prints.map((r) => 'InvoiceNumber eq ' + r.InvoiceNumber).join(' or ');
                this.previewModal.openWithFilter(report, filter);
            }
        }, err => this.errorService.handle(err));
    }

    private setupReminderTable() {
        if (!this.modalMode) {
            this.reminderService.GetAll('orderby=CustomerInvoiceID desc,ReminderNumber desc').subscribe((reminders) => this.updateReminderList(reminders));
        }

        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text).setFilterOperator('contains');
        let emailCol = new UniTableColumn('EmailAddress', 'Epost', UniTableColumnType.Text).setFilterOperator('contains');
        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Fakturabeløp', UniTableColumnType.Number)
            .setWidth('12%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        this.reminderTable = new UniTableConfig(true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setColumns([reminderNumberCol, invoiceNumberCol, customerNameCol, emailCol, taxInclusiveAmountCol]);
    }
}