import {Component, Input, OnInit, ViewChild, ViewChildren, QueryList, SimpleChange} from '@angular/core';
import {UniTable, UniTableColumn, UniTableConfig, UniTableColumnType} from 'unitable-ng2/main';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {SendEmail} from '../../../../models/sendEmail';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {LocalDate} from '../../../../unientities';
import {FieldType} from 'uniform-ng2/main';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService,
    NumberFormat,
    ReportService
} from '../../../../services/services';

declare const moment;

export interface IRunNumberData {
    RunNumber: number;
    CreatedBy: string;
    RemindedDate: LocalDate;
}

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
    private reminderQuery = 'model=CustomerInvoiceReminder&select=ID as ID,StatusCode as StatusCode,DueDate as DueDate,ReminderNumber as ReminderNumber,CustomerInvoice.ID as InvoiceID,CustomerInvoice.InvoiceNumber as InvoiceNumber,CustomerInvoice.PaymentDueDate as InvoiceDueDate,CustomerInvoice.InvoiceDate as InvoiceDate,CustomerInvoice.CustomerID as CustomerID,CustomerInvoice.CustomerName as CustomerName,DefaultEmail.EmailAddress as EmailAddress,CustomerInvoice.RestAmount as RestAmount,CustomerInvoice.TaxInclusiveAmount as TaxInclusiveAmount&expand=CustomerInvoice,CustomerInvoice.Customer.Info.DefaultEmail&filter=';

    private currentRunNumber: number = 0;
    private currentRunNumberData: IRunNumberData;
    private runNumbers: IRunNumberData[];
    private customerSums: any;
    private toolbarconfig: IToolbarConfig;

    private searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private saveactions: IUniSaveAction[] = [
         {
             label: 'Send og skriv ut valgte',
             action: (done) => this.sendReminders(done, false),
             main: true,
             disabled: !!this.remindersAll
         },
         {
             label: 'Send valgte på epost',
             action: (done) => this.sendEmails(done),
             disabled: !!this.remindersEmail
         },
         {
             label: 'Skriv ut valgte',
             action: (done) => this.sendReminders(done, true),
             disabled: !!this.remindersAll
         }
    ];

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private reminderService: CustomerInvoiceReminderService,
        private reportDefinitionService: ReportDefinitionService,
        private numberFormat: NumberFormat,
        private reportService: ReportService
    ) {
    }

    public ngOnInit() {
        this.loadLastRunNumber();
        this.setupReminderTable();

        this.statisticsService.GetAllUnwrapped('model=CustomerInvoiceReminder&select=RunNumber as RunNumber,User.DisplayName%20as%20CreatedBy,RemindedDate%20as%20RemindedDate&orderby=RunNumber%20desc&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity')
            .subscribe((data) => {
                this.runNumbers = data;
                this.fields$.next(this.getLayout().Fields);
            });
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

        if (printonly) {
            done('Utskrift av purringer');
            this.sendPrint(true);
        } else {
            done('Purringer sendes');
            this.sendEmail();
            this.sendPrint(false);
        }
    }

    private sendEmails(done) {
        var selected = this.getSelectedEmail();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil sende purringer på epost for, eller kryss av for alle'
            );

            done('Sending avbrutt');
            return;
        }

        this.reminderService.sendAction(selected.map(x => x.ID)).subscribe(() => {
            done('Purringer sendes');
            this.loadRunNumber(this.currentRunNumber);
            this.sendEmail();
        });
    }

    public updateToolbar() {
        let toolbarconfig: IToolbarConfig = {
            title: 'Purrejobbnr. ' + this.currentRunNumber,
            subheads: [
                {title: this.currentRunNumberData.CreatedBy},
                {title: moment(this.currentRunNumberData.RemindedDate).format('lll')}
            ],
            navigation: {
                prev: this.previousRunNumber.bind(this),
                next: this.nextRunNumber.bind(this)
            }
        };

        this.toolbarconfig = toolbarconfig;
    }

    public loadLastRunNumber() {
        this.statisticsService.GetAllUnwrapped('model=CustomerInvoiceReminder&select=RunNumber%20as%20RunNumber&orderby=RunNumber%20desc&top=1')
            .subscribe((data) => {
                let reminder = data[0];
                if (reminder) { this.loadRunNumber(reminder.RunNumber); }
            });
    }

    public loadRunNumber(runNumber): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.modalMode || runNumber < 1) {
                resolve(false);
            } else {
                Observable.forkJoin([
                    this.reminderService.GetAll('orderby=CustomerInvoiceID desc,ReminderNumber desc&filter=RunNumber eq ' + runNumber),
                    this.statisticsService.GetAllUnwrapped('model=CustomerInvoiceReminder&select=User.DisplayName%20as%20CreatedBy,RemindedDate%20as%20RemindedDate&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity&top=1&filter=RunNumber%20eq%20' + runNumber)
                ]).subscribe((res) => {
                    let reminders = res[0];
                    let extra = res[1][0];
                    this.currentRunNumberData = extra;

                    if (reminders.length === 0) {
                        resolve(false);
                    } else {
                        this.currentRunNumber = runNumber;
                        this.updateToolbar();
                        this.updateReminderList(reminders);
                        resolve(true);
                    }
                }, (err) => {
                    resolve(false);
                });
            }
        });
    }

    public previousRunNumber() {
        this.loadRunNumber(this.currentRunNumber - 1).then((ok) => {
           if (!ok) { this.toastService.addToast('Første purrejobb!', ToastType.warn, 5, 'Du har nådd første purrejobb.'); }
        });
    }

    public nextRunNumber() {
        this.loadRunNumber(this.currentRunNumber + 1).then((ok) => {
            if (!ok) { this.toastService.addToast('Siste purrejobb!', ToastType.warn, 5, 'Du har nådd siste purrejobb.'); }
        });
    }

    public updateReminderList(reminders) {
        if (this.currentRunNumber === 0) { this.currentRunNumber = reminders[0].RunNumber; }
        let filter = reminders.map((r) => 'ID eq ' + r.ID).join(' or ');
        this.statisticsService.GetAllUnwrapped(this.reminderQuery + filter)
            .subscribe((remindersAll) => {
                let cfilter = remindersAll.map((r) => `SubAccount.CustomerID eq ${r.CustomerID}`).join(' or ');
                this.statisticsService.GetAllUnwrapped('model=JournalEntryLine&expand=SubAccount&select=SubAccount.CustomerID,sum(Amount)&filter=' + cfilter)
                    .subscribe((customersums) => {
                        this.customerSums = customersums;

                        this.remindersAll = remindersAll;
                        this.remindersAll = remindersAll.map((r) => {
                            r._rowSelected = true;
                            return r;
                        });

                        this.remindersEmail = this.remindersAll.filter((r) => !!r.EmailAddress);
                        this.remindersPrint = this.remindersAll.filter((r) => this.remindersEmail.indexOf(r) < 0);
                    });
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

        this.reminderService.sendAction(emails.map(x => x.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            emails.forEach((r) => {
                let email = new SendEmail();
                email.Format = 'pdf';
                email.EmailAddress = r.EmailAddress;
                email.EntityType = 'CustomerInvoiceReminder';
                email.EntityID = r.ID;
                email.Subject = `Purring fakturanr. ${r.InvoiceNumber}`;
                email.Message = `Vedlagt finner du purring ${r.ReminderNumber} for faktura ${r.InvoiceNumber}`;

                let parameters = [{Name: 'odatafilter', value: `ID eq ${r.ID}`}];
                this.reportService.generateReportSendEmail('Purring', email, parameters);
            });
        });
    }

    public sendPrint(all) {
        var prints = all ? this.getSelected() : this.getSelectedPrint();
        if (prints.length === 0) { return; }

        this.reminderService.sendAction(prints.map(x => x.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            this.reportDefinitionService.getReportByName('Purring').subscribe((report) => {
                if (report) {
                    let filter = prints.map((r) => 'ID eq ' + r.ID).join(' or ');
                    report.parameters = [{Name: 'odatafilter', value: filter}];
                    this.previewModal.open(report);
                }
            }, err => this.errorService.handle(err));
        });
    }

    private setupReminderTable() {
        let reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text)
            .setWidth('8%')
            .setFilterOperator('contains');
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setWidth('8%')
            .setFilterOperator('contains')
            .setTemplate((reminder) => {
                let title = `Fakturadato: ${moment(reminder.InvoiceDate).format('DD.MM.YYYY')}\nForfallsdato: ${moment(reminder.InvoiceDueDate).format('DD.MM.YYYY')}`;
                return this.modalMode
                    ? `<span' title='${title}'>${reminder.InvoiceNumber}</span>`
                    : `<a href='/#/sales/invoices/${reminder.InvoiceID}' title='${title}'>${reminder.InvoiceNumber}</a>`;
            });
        let dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);
        let customerNameCol = new UniTableColumn('CustomerName', 'Kunde')
            .setWidth('20%')
            .setFilterOperator('contains')
            .setTemplate((reminder) => {
                let customersum = this.customerSums.find(x => x.SubAccountCustomerID === reminder.CustomerID);
                let title = `Kundereskontro: ${this.numberFormat.asMoney(customersum ? customersum.sumAmount : 0)}`;
                return this.modalMode
                    ? `<span title='${title}'>${reminder.CustomerName}</span>`
                    : `<a href='/#/sales/customer/${reminder.CustomerID}' title='${title}'>${reminder.CustomerName}</a>`;
            });
        let emailCol = new UniTableColumn('EmailAddress', 'Epost', UniTableColumnType.Text)
            .setFilterOperator('contains');
        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setTemplate((reminder) => {
                return this.reminderService.getStatusText(reminder.StatusCode);
            });
        var amountCol = new UniTableColumn('TaxInclusiveAmount', 'Fakturabeløp', UniTableColumnType.Number)
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
            .setColumns([reminderNumberCol, invoiceNumberCol,
                         customerNameCol, emailCol, amountCol, dueDateCol, statusCol]);
    }

    public onFormFilterChange(event) {
        let runnumber: SimpleChange = event.RunNumber;
        this.loadRunNumber(runnumber.currentValue);
    }

    private getLayout() {
        return {
            Name: 'RunNumberList',
            BaseEntity: 'CustomerInvoiceReminder',
            StatusCode: 0,
            Deleted: false,
            CreatedAt: null,
            UpdatedAt: null,
            CreatedBy: null,
            UpdatedBy: null,
            ID: 1,
            CustomFields: null,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'CustomerInvoiceReminder',
                    Property: 'RunNumber',
                    Placement: 4,
                    Hidden: false,
                    FieldType: FieldType.DROPDOWN,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Velg jobb',
                    Description: '',
                    HelpText: '',
                    FieldSet: 0,
                    Section: 0,
                    Placeholder: null,
                    LineBreak: null,
                    Combo: null,
                    Legend: '',
                    StatusCode: 0,
                    ID: 1,
                    Deleted: false,
                    CreatedAt: null,
                    UpdatedAt: null,
                    CreatedBy: null,
                    UpdatedBy: null,
                    CustomFields: null,
                    Options: {
                        source: this.runNumbers,
                        valueProperty: 'RunNumber',
                        template: (run: IRunNumberData) => {
                            return run ? `Purrejobbnr. ${run.RunNumber}: ${moment(run.RemindedDate).format('lll')} - ${run.CreatedBy}` : '';
                        },
                        debounceTime: 200
                    }
                }
            ]
        };
    }
}
