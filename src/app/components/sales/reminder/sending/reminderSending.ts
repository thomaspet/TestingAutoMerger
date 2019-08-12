import {Component, Input, ViewChildren, QueryList, SimpleChange} from '@angular/core';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {ActivatedRoute} from '@angular/router';
import {SendEmail} from '../../../../models/sendEmail';
import {IToolbarConfig} from './../../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {Observable} from 'rxjs';
import {LocalDate, CustomerInvoiceReminder, ReportDefinition, StatusCodeCustomerInvoiceReminder} from '../../../../unientities';
import {FieldType} from '../../../../../framework/ui/uniform/index';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService,
    EmailService,
    EHFService,
    PageStateService
} from '../../../../services/services';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    INumberFormat
} from '../../../../../framework/ui/unitable/index';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import * as moment from 'moment';

export interface IRunNumberData {
    RunNumber: number;
    CreatedBy: string;
    RemindedDate: LocalDate;
}

export interface CustomReminder extends CustomerInvoiceReminder {
    InvoiceID: number;
    InvoiceNumber: number;
    InvoiceDueDate: LocalDate;
    InvoiceDate: LocalDate;
    CustomerID: number;
    CustomerName: string;
    RestAmountCurrency: number;
    TaxInclusiveAmountCurrency: number;
    CustomerNumber: number;
    _CurrencyCode: string;
}

@Component({
    selector: 'reminder-sending',
    templateUrl: './reminderSending.html'
})
export class ReminderSending {
    @Input() config: any;
    @Input() modalMode: boolean;
    @ViewChildren(AgGridWrapper)
    private tables: QueryList<AgGridWrapper>;

    public remindersEmail: CustomReminder[];
    public remindersPrint: CustomReminder[];
    public reminderTable: UniTableConfig;
    private remindersAll: CustomReminder[];
    private reminderQuery: string = 'model=CustomerInvoiceReminder&select=ID as ID,StatusCode as StatusCode,'
        + 'DueDate as DueDate,ReminderNumber as ReminderNumber,ReminderFeeCurrency as ReminderFeeCurrency,'
        + 'InterestFeeCurrency as InterestFeeCurrency,CustomerInvoice.ID as InvoiceID,CustomerInvoice.InvoiceNumber as InvoiceNumber,'
        + 'CustomerInvoice.PaymentDueDate as InvoiceDueDate,CustomerInvoice.InvoiceDate as InvoiceDate,'
        + 'CustomerInvoice.CustomerID as CustomerID,CustomerInvoice.CustomerName as CustomerName,'
        + 'CustomerInvoiceReminder.EmailAddress as EmailAddress,'
        + 'add(sum(isnull(restamountcurrency,0)),max(customerinvoice.restamountcurrency)) as _RestAmountCurrency,'
        + 'CustomerInvoice.TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency,'
        + 'Customer.CustomerNumber as CustomerNumber,CurrencyCode.Code as _CurrencyCode&expand=CustomerInvoice,'
        + 'CustomerInvoice.Customer.Info.DefaultEmail,CurrencyCode&filter='
        + 'isnull(statuscode,0) ne 41204 and (customerinvoice.collectorstatuscode ne 42505 or '
        + 'isnull(customerinvoice.collectorstatuscode,0) eq 0) and ';

    currentRunNumber: number = 0;
    currentRunNumberData: IRunNumberData;
    runNumbers: IRunNumberData[];
    toolbarconfig: IToolbarConfig;
    private isWarnedAboutRememberToSaveChanges: Boolean = false;
    private changedReminders: CustomerInvoiceReminder[] = [];

    searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 2
    };

    saveactions: IUniSaveAction[] = [
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
            label: 'Send alle valgte til fakturaprint',
            action: (done) => this.sendInvoicePrint(done),
            disabled: !this.ehfService.isInvoicePrintActivated()
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
        private modalService: UniModalService,
        private emailService: EmailService,
        private ehfService: EHFService,
        private pageStateService: PageStateService,
        private tabService: TabService,
        private route: ActivatedRoute
    ) {
        route.queryParams.subscribe((params) => {
            this.currentRunNumber = +params['runNumber'];
            this.setupReminderTable();
            this.statisticsService.GetAllUnwrapped(
                'model=CustomerInvoiceReminder'
                + '&select=RunNumber as RunNumber,User.DisplayName%20as%20CreatedBy,RemindedDate%20as%20RemindedDate'
                + '&orderby=RunNumber%20desc'
                + '&join=CustomerInvoiceReminder.CreatedBy%20eq%20User.GlobalIdentity'
            ).subscribe((data) => {
                this.runNumbers = data;

                if (this.runNumbers && this.runNumbers.length > 0) {
                    this.currentRunNumber = this.currentRunNumber || this.runNumbers[0].RunNumber;
                    this.loadRunNumber(this.currentRunNumber);
                }
                this.fields$.next(this.getLayout().Fields);
                this.addTab();
            }, err => {
                this.addTab();
                this.errorService.handle(err);
            });
        });
    }

    public addTab() {
        this.pageStateService.setPageState('runNumber', this.currentRunNumber + '');
        this.tabService.addTab({
            name: 'Purring',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.Reminders,
            active: true
        });
    }

    onRowChanged(data) {
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

    saveReminders(done: (msg: string) => void = () => {}) {
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

    private sendReminders(done: (message: string) => void, printonly) {
        const selected = this.getSelected();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke purringer du vil sende, eller kryss av for alle'
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

    private sendEmails(done: (message: string) => void) {
        const selected = this.getSelectedEmail();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                10,
                'Vennligst velg hvilke purringer du vil sende på e-post, eller kryss av for alle'
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

    updateToolbar() {
        const toolbarconfig: IToolbarConfig = {
            title: 'Purrejobbnr. ' + this.currentRunNumber,
            subheads: [
                {title: this.currentRunNumberData.CreatedBy},
                {title: moment(this.currentRunNumberData.RemindedDate).format('lll')}
            ],
            omitFinalCrumb: true,
            navigation: {
                prev: this.previousRunNumber.bind(this),
                next: this.nextRunNumber.bind(this)
            }
        };

        this.toolbarconfig = toolbarconfig;
    }

    loadRunNumber(runNumber): Promise<any> {
        return new Promise((resolve, reject) => {
            if (runNumber < 1) {
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
                        this.addTab();
                        resolve(true);
                    }
                }, (err) => {
                    resolve(false);
                });
            }
        });
    }

    previousRunNumber() {
        this.loadRunNumber(this.currentRunNumber - 1).then((ok) => {
            if (!ok) {
               this.toastService.addToast('Første purrejobb!', ToastType.warn, 5, 'Du har nådd første purrejobb.');
            }
        });
    }

    nextRunNumber() {
        this.loadRunNumber(this.currentRunNumber + 1).then((ok) => {
            if (!ok) {
                this.toastService.addToast('Siste purrejobb!', ToastType.warn, 5, 'Du har nådd siste purrejobb.');
            }
        });
    }

    updateReminderList(reminders) {
        if (this.currentRunNumber === 0) { this.currentRunNumber = reminders[0].RunNumber; }
        const filter = `RunNumber eq ${this.currentRunNumber}`;
        this.statisticsService.GetAllUnwrapped(this.reminderQuery + filter)
            .subscribe((remindersAll: CustomReminder[]) => {
                this.remindersAll = remindersAll.map(reminder => {
                    reminder['_rowSelected'] = true;
                    return reminder;
                });

                this.remindersEmail = this.remindersAll.filter(reminder => !!reminder.EmailAddress);
                this.remindersPrint = this.remindersAll.filter(reminder => this.remindersEmail.indexOf(reminder) < 0);
            });
    }

    getSelected() {
        const tables = this.tables.toArray();
        const emailReminders: CustomReminder[] = tables[0] && tables[0].getSelectedRows() || [];
        const printReminders: CustomReminder[] = tables[1] && tables[1].getSelectedRows() || [];

        return emailReminders.concat(printReminders);
    }

    getSelectedEmail() {
        const tables = this.tables.toArray();
        return tables[0] && tables[0].getSelectedRows() || [];
    }

    getSelectedPrint() {
        const tables = this.tables.toArray();
        return tables[1] && tables[1].getSelectedRows() || [];
    }

    sendEmail(doneHandler?) {
        const emailReminders = this.getSelectedEmail();
        if (emailReminders.length === 0) { return; }
        this.reminderService.sendAction(emailReminders.map(reminder => reminder.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            emailReminders.forEach(reminder => {
                const email = new SendEmail();
                email.Format = 'pdf';
                email.EmailAddress = reminder.EmailAddress;
                email.EntityType = 'CustomerInvoiceReminder';
                email.EntityID = reminder.ID;
                email.Subject = `Purring fakturanr. ${reminder.InvoiceNumber}`;
                email.Message = `Vedlagt finner du purring ${reminder.ReminderNumber} for faktura ${reminder.InvoiceNumber}`;

                const parameters = [
                    {Name: 'CustomerInvoiceID', value: reminder.InvoiceID},
                    {Name: 'ReminderNumber', value: reminder.ReminderNumber}
                ];

                this.reportDefinitionService.GetAll(`filter=name eq 'Purring'`).subscribe(rd => {
                    this.emailService.sendEmailWithReportAttachment(
                        'Models.Sales.CustomerInvoiceReminder', rd[0].ID, email, parameters, doneHandler);
                });
            });
        });
    }

    sendPrint(all: boolean) {
        const printReminders: CustomReminder[] = all ? this.getSelected() : this.getSelectedPrint();
        if (printReminders.length === 0) { return; }
        this.reminderService.sendAction(printReminders.map(reminder => reminder.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);

            this.reportDefinitionService.getReportByName('Purring').subscribe((report: ReportDefinition) => {
                if (report) {
                    const invoiceFilterParam = printReminders.map(reminder => 'CustomerInvoice.ID eq ' + reminder.InvoiceID).join(' or ');
                    const reminderNumberParam = printReminders.map(reminder => reminder.ReminderNumber).reduce((a, b) => a > b ? a : b);
                    report['parameters'] = [
                        {Name: 'CustomerInvoiceID', value: 0},
                        {Name: 'ReminderFilter', value: invoiceFilterParam},
                        {Name: 'ReminderNumber', value: reminderNumberParam}
                    ];

                    this.modalService.open(UniPreviewModal, {
                        data: report
                    });
                }
            }, err => this.errorService.handle(err));
        });
    }

    sendInvoicePrint(done?: (message: string) => void) {
        const selected = this.getSelected();
        if (selected.length === 0) {
            this.toastService.addToast(
                'Ingen rader er valgt',
                ToastType.bad,
                ToastTime.medium,
                'Vennligst velg hvilke purringer du vil sende til print, eller kryss av for alle'
            );

            if (done) { done('Sending avbrutt'); }
            return;
        }
        if (done) { done('Sender purringer til print'); }
        this.reminderService.sendInvoicePrintAction(selected.map(reminder => reminder.ID)).subscribe(() => {
            this.loadRunNumber(this.currentRunNumber);
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
            .setNumberFormat(this.numberFormat)
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmountCurrency >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        const restAmountCol = new UniTableColumn('_RestAmountCurrency', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item._RestAmountCurrency <= 0) ? 'number-good' : 'number-bad';
            });

        const feeAmountCol = new UniTableColumn('ReminderFeeCurrency', 'Gebyr', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setEditable(false)
            .setConditionalCls((item) => {
                return (+item.RestAmountCurrency <= item.InterestFeeCurrency)
                    || (+item.RestAmountCurrency === 0) ? 'number-good' : 'number-bad';
            });

        const interestAmountCol = new UniTableColumn('InterestFeeCurrency', 'Renter', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setNumberFormat(this.numberFormat)
            .setEditable((item) => item.StatusCode !== StatusCodeCustomerInvoiceReminder.Completed)
            .setVisible(false)
            .setConditionalCls((item) => {
                return (+item.RestAmountCurrency === 0) ? 'number-good' : 'number-bad';
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
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(false)
            .setMultiRowSelect(true)
            .setDeleteButton(false)
            .setChangeCallback( x => this.onEditChange(x) )
            .setColumns([
                reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol,
                emailCol, currencyCodeCol, taxInclusiveAmountCol, restAmountCol,
                feeAmountCol, interestAmountCol, dueDateCol, statusCol
            ]);
    }

    onEditChange(event) {
        return event.rowModel;
    }

    onFormFilterChange(event) {
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
