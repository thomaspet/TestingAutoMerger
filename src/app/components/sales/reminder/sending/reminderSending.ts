import {Component, Input, OnInit, ViewChildren, QueryList, SimpleChange} from '@angular/core';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {SendEmail} from '../../../../models/sendEmail';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {LocalDate, CustomerInvoiceReminder} from '../../../../unientities';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService,
    NumberFormat,
    EmailService
} from '../../../../services/services';
import {
    UniTable,
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType
} from '../../../../../framework/ui/unitable/index';
import * as moment from 'moment';

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

    public remindersEmail: any;
    public remindersPrint: any;
    private remindersAll: any;
    private reminderTable: UniTableConfig;
    private reminderQuery: string = 'model=CustomerInvoiceReminder&select=ID as ID,StatusCode as StatusCode,'
        + 'DueDate as DueDate,ReminderNumber as ReminderNumber,ReminderFeeCurrency as ReminderFeeCurrency'
        + ',CustomerInvoice.ID as InvoiceID,CustomerInvoice.InvoiceNumber as InvoiceNumber,'
        + 'CustomerInvoice.PaymentDueDate as InvoiceDueDate,CustomerInvoice.InvoiceDate as InvoiceDate,'
        + 'CustomerInvoice.CustomerID as CustomerID,CustomerInvoice.CustomerName as CustomerName,'
        + 'CustomerInvoiceReminder.EmailAddress as EmailAddress,'
        + 'CustomerInvoice.RestAmountCurrency as RestAmountCurrency,'
        + 'CustomerInvoice.TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency,'
        + 'Customer.CustomerNumber as CustomerNumber,CurrencyCode.Code as _CurrencyCode&expand=CustomerInvoice,'
        + 'CustomerInvoice.Customer.Info.DefaultEmail,CurrencyCode&filter=';

    public currentRunNumber: number = 0;
    public currentRunNumberData: IRunNumberData;
    public runNumbers: IRunNumberData[];
    public toolbarconfig: IToolbarConfig;
    private isWarnedAboutRememberToSaveChanges: Boolean = false;
    private changedReminders: CustomerInvoiceReminder[] = [];

    public searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    public config$: BehaviorSubject<any> = new BehaviorSubject({});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public saveactions: IUniSaveAction[] = [
         {
             label: 'Send og skriv ut valgte',
             action: (done) => this.sendReminders(done, false),
             main: true,
             disabled: !!this.remindersAll
         },
         {
             label: 'Send valgte på e-post',
             action: (done) => this.sendEmails(done),
             disabled: !!this.remindersEmail
         },
         {
             label: 'Skriv ut valgte',
             action: (done) => this.sendReminders(done, true),
             disabled: !!this.remindersAll
         },
         {
             label: 'Slett valgte',
             action: (done) => this.deleteReminders(done),
             disabled: !!this.remindersAll
         },
         {
             label: 'Lagre endringer',
             action: (done) => this.saveReminders(done),
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
        private modalService: UniModalService,
        private emailService: EmailService
    ) {}

    public ngOnInit() {
        this.setupReminderTable();
        this.statisticsService.GetAllUnwrapped(
            'model=CustomerInvoiceReminder'
            + '&select=RunNumber as RunNumber,User.DisplayName%20as%20CreatedBy,RemindedDate%20as%20RemindedDate'
            + '&orderby=RunNumber%20desc'
            + '&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity'
        )
            .subscribe((data) => {
                this.runNumbers = data;
                if (this.runNumbers && this.runNumbers.length > 0) {
                    this.loadRunNumber(this.runNumbers[0].RunNumber);
                }
                this.fields$.next(this.getLayout().Fields);
            });
    }

    public onRowChanged(data) {
        if (!this.isWarnedAboutRememberToSaveChanges) {
            this.toastService.addToast(
                'Lagre purringer',
                ToastType.warn,
                5,
                'Huske å lagre endringer du gjør på purringene!'
            );
            this.isWarnedAboutRememberToSaveChanges = true;
            this.saveactions[4].main = true;
            this.saveactions[0].main = false;
            this.saveactions = [...this.saveactions];
        }

        let rowExists = false;
        for (let i = 0; i < this.changedReminders.length; i++) {
            if (this.changedReminders[i].ID === data.rowModel.ID) {
                this.changedReminders[i] = data.rowModel;
                rowExists = true;
            }
        }
        if (!rowExists) {
            this.changedReminders.push(data.rowModel);
        }
    }

    public saveReminders(done: (msg: string) => void = () => {}) {
        const requests = [];
        for (let i = 0; i < this.changedReminders.length; i++) {

            if (typeof this.changedReminders[i].DueDate === 'string') {
                this.changedReminders[i].DueDate = new LocalDate(this.changedReminders[i].DueDate.toString());
            }

            requests.push(this.reminderService.Put(this.changedReminders[i].ID, this.changedReminders[i]));
        }
        Observable.forkJoin(requests)
            .subscribe(resp => {
                this.toastService.addToast('Purringer ble lagret.', ToastType.good, 5);
                this.isWarnedAboutRememberToSaveChanges = false;
                this.saveactions[4].main = false;
                this.saveactions[0].main = true;
                this.saveactions = [...this.saveactions];
                this.changedReminders = [];
                done('Purringene ble lagret.');
                this.loadRunNumber(this.currentRunNumber);
            }, (err) => {
            done('Feil ved lagring av purringer');
            this.loadRunNumber(this.currentRunNumber);
            this.errorService.handle(err);
        });
    }

    private deleteReminders(done) {
        const selected = this.getSelected();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen purringer er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke purringer du vil slette, eller kryss av for alle'
            );

            done('Ingen purringer slettet');
            return;
        }

        this.modalService.confirm({
            header: 'Bekreft sletting',
            message: 'Vennligst bekreft sletting av valgte purringer',
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                const requests = [];
                selected.forEach(x => {
                    requests.push(this.reminderService.Remove(x.ID, x));
                });

                Observable.forkJoin(requests).subscribe(
                    res => {
                        this.toastService.addToast('Purringer slettet', ToastType.good, 5);
                        done('Purringer slettet');

                        this.loadRunNumber(this.currentRunNumber);
                    },
                    err => {
                        done('Feil ved sletting av purringer');
                        this.loadRunNumber(this.currentRunNumber);
                        this.errorService.handle(err);
                    }
                );
            } else {
                done('Sletting ble avbrutt');
            }
        });
    }

    private sendReminders(done, printonly) {
        const selected = this.getSelected();
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
            this.sendEmail(done);
            this.sendPrint(false);
        }
    }

    private sendEmails(done) {
        const selected = this.getSelectedEmail();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke linjer du vil sende purringer på e-post for, eller kryss av for alle'
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
        const toolbarconfig: IToolbarConfig = {
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

    public loadRunNumber(runNumber): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.modalMode || runNumber < 1) {
                resolve(false);
            } else {
                Observable.forkJoin([
                    this.reminderService.GetAll(
                        'orderby=CustomerInvoiceID desc,ReminderNumber desc&filter=RunNumber eq '
                        + runNumber
                    ),
                    this.statisticsService.GetAllUnwrapped(
                        'model=CustomerInvoiceReminder'
                        + '&select=User.DisplayName%20as%20CreatedBy,RemindedDate%20as%20RemindedDate'
                        + '&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity&top=1'
                        + '&filter=RunNumber%20eq%20'
                        + runNumber
                    )
                ]).subscribe((res) => {
                    const reminders = res[0];
                    const extra = res[1][0];
                    this.currentRunNumberData = extra;

                    if (reminders.length === 0) {
                        resolve(false);
                    } else {
                        this.currentRunNumber = runNumber;
                        this.updateToolbar();
                        this.updateReminderList(reminders);
                        this.searchParams$.next({RunNumber: runNumber});
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
            if (!ok) {
               this.toastService.addToast('Første purrejobb!', ToastType.warn, 5, 'Du har nådd første purrejobb.');
            }
        });
    }

    public nextRunNumber() {
        this.loadRunNumber(this.currentRunNumber + 1).then((ok) => {
            if (!ok) {
                this.toastService.addToast('Siste purrejobb!', ToastType.warn, 5, 'Du har nådd siste purrejobb.');
            }
        });
    }

    public updateReminderList(reminders) {
        if (this.currentRunNumber === 0) { this.currentRunNumber = reminders[0].RunNumber; }
        const filter = `RunNumber eq ${this.currentRunNumber}`;
        this.statisticsService.GetAllUnwrapped(this.reminderQuery + filter)
            .subscribe((remindersAll) => {
                this.remindersAll = remindersAll.map((r) => {
                    r._rowSelected = true;
                    return r;
                });

                this.remindersEmail = this.remindersAll.filter((r) => !!r.EmailAddress);
                this.remindersPrint = this.remindersAll.filter((r) => this.remindersEmail.indexOf(r) < 0);
            });
    }

    public getSelected() {
        const tables = this.tables.toArray();
        const emails = tables[0] && tables[0].getSelectedRows() || [];
        const print = tables[1] && tables[1].getSelectedRows() || [];

        return emails.concat(print);
    }

    public getSelectedEmail() {
        const tables = this.tables.toArray();
        return tables[0] && tables[0].getSelectedRows() || [];
    }

    public getSelectedPrint() {
        const tables = this.tables.toArray();
        return tables[1] && tables[1].getSelectedRows() || [];
    }

    public sendEmail(doneHandler?) {
        const emails = this.getSelectedEmail();
        if (emails.length === 0) { return; }
        this.reminderService.sendAction(emails.map(x => x.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            emails.forEach((r) => {
                const email = new SendEmail();
                email.Format = 'pdf';
                email.EmailAddress = r.EmailAddress;
                email.EntityType = 'CustomerInvoiceReminder';
                email.EntityID = r.ID;
                email.Subject = `Purring fakturanr. ${r.InvoiceNumber}`;
                email.Message = `Vedlagt finner du purring ${r.ReminderNumber} for faktura ${r.InvoiceNumber}`;

                const parameters = [{Name: 'odatafilter', value: `ID eq ${r.ID}`}];
                this.emailService.sendEmailWithReportAttachment('Purring', email, parameters, doneHandler);
            });
        });
    }

    public sendPrint(all) {
        const prints = all ? this.getSelected() : this.getSelectedPrint();
        if (prints.length === 0) { return; }
        this.reminderService.sendAction(prints.map(x => x.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            this.reportDefinitionService.getReportByName('Purring').subscribe((report) => {
                if (report) {
                    const filter = prints.map((r) => 'ID eq ' + r.ID).join(' or ');
                    report.parameters = [{Name: 'odatafilter', value: filter}];

                    this.modalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            }, err => this.errorService.handle(err));
        });
    }

    private setupReminderTable() {
        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr', UniTableColumnType.Text)
            .setWidth('8%')
            .setEditable(false)
            .setFilterOperator('contains');

        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.')
            .setWidth('8%')
            .setEditable(false)
            .setFilterOperator('contains');

        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('startswith')
            .setEditable(false);

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde')
            .setWidth('20%')
            .setEditable(false)
            .setFilterOperator('contains');

        const emailCol = new UniTableColumn('EmailAddress', 'E-post', UniTableColumnType.Text)
            .setFilterOperator('contains');

        const statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setEditable(false)
            .setTemplate((reminder) => {
                return this.reminderService.getStatusText(reminder.StatusCode);
            });

        const currencyCodeCol = new UniTableColumn('_CurrencyCode', 'Valuta', UniTableColumnType.Text)
            .setFilterOperator('contains')
            .setEditable(false)
            .setWidth('5%');

        const taxInclusiveAmountCol = new UniTableColumn(
            'TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Number
        )
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const restAmountCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item.RestAmountCurrency >= 0) ? 'number-good' : 'number-bad';
            });

        const feeAmountCol = new UniTableColumn('ReminderFeeCurrency', 'Gebyr', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        if (!this.modalMode) {
            invoiceNumberCol.setType(UniTableColumnType.Link);
            invoiceNumberCol.setLinkResolver(reminder => `/sales/invoices/${reminder.InvoiceID}`);

            customerNumberCol.setType(UniTableColumnType.Link);
            customerNumberCol.setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`);

            customerNameCol.setType(UniTableColumnType.Link);
            customerNameCol.setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`);

        }

        this.reminderTable = new UniTableConfig('sales.reminders.reminderSending', true, true, 25)
            .setSearchable(false)
            .setColumnMenuVisible(false)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setChangeCallback( x => this.onEditChange(x) )
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol,
                emailCol, currencyCodeCol, taxInclusiveAmountCol, restAmountCol,
                feeAmountCol, dueDateCol, statusCol
            ]);
    }

    public onEditChange(event) {
        return event.rowModel;
    }

    public onFormFilterChange(event) {
        const runnumber: SimpleChange = event.RunNumber;
        this.loadRunNumber(runnumber.currentValue);
    }

    private getLayout() {
        return {
            Name: 'RunNumberList',
            BaseEntity: 'CustomerInvoiceReminder',
            Fields: [
                {
                    Label: 'Velg jobb',
                    Property: 'RunNumber',
                    FieldType: FieldType.DROPDOWN,
                    Options: {
                        source: this.runNumbers,
                        valueProperty: 'RunNumber',
                        template: (run: IRunNumberData) => {
                            return run
                                ? `Purrejobbnr. ${run.RunNumber}: `
                                    + `${moment(run.RemindedDate).format('lll')} - ${run.CreatedBy}`
                                : '';
                        },
                        debounceTime: 200,
                        hideDeleteButton: true
                    }
                }
            ]
        };
    }
}
