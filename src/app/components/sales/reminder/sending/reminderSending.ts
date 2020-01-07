import {Component, Input, ViewChild} from '@angular/core';
import {ToastService, ToastType, ToastTime} from '../../../../../framework/uniToast/toastService';
import {ActivatedRoute} from '@angular/router';
import {SendEmail} from '../../../../models/sendEmail';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {Observable} from 'rxjs';
import {LocalDate, CustomerInvoiceReminder, ReportDefinition} from '../../../../unientities';
import {UniModalService, ConfirmActions} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {UniPreviewModal} from '../../../reports/modals/preview/previewModal';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniReminderSendingEditModal} from './reminderSendingEditModal';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService,
    EmailService,
    ReportService,
    StatusService
} from '../../../../services/services';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    INumberFormat,
    ITableFilter
} from '../../../../../framework/ui/unitable/index';
import { UniReminderSendingMethodModal } from './reminderSendingMethodModal';
import { List } from 'immutable';

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
    @ViewChild(AgGridWrapper)
    private table: AgGridWrapper;

    public reminderTable: UniTableConfig;
    public remindersAll: CustomReminder[];
    private reminderQuery: string = 'model=CustomerInvoiceReminder&select=ID as ID,StatusCode as StatusCode,'
        + 'RunNumber as RunNumber,RemindedDate as RemindedDate,'
        + 'DueDate as DueDate,ReminderNumber as ReminderNumber,ReminderFeeCurrency as ReminderFeeCurrency,'
        + 'InterestFeeCurrency as InterestFeeCurrency,CustomerInvoice.ID as InvoiceID,CustomerInvoice.InvoiceNumber as InvoiceNumber,'
        + 'CustomerInvoice.PaymentDueDate as InvoiceDueDate,CustomerInvoice.InvoiceDate as InvoiceDate,'
        + 'CustomerInvoice.CustomerID as CustomerID,CustomerInvoice.CustomerName as CustomerName,'
        + 'CustomerInvoiceReminder.EmailAddress as EmailAddress,'
        + 'add(isnull(restamountcurrency,0),customerinvoice.restamountcurrency) as _RestAmountCurrency,'
        + "getlatestsharingtype('CustomerInvoiceReminder',ID) as LastSharingType,"
        + "getlatestsharingstatus('CustomerInvoiceReminder',ID) as LastSharingStatus,"
        + "getlatestsharingdate('CustomerInvoiceReminder',ID) as LastSharingDate,"
        + 'CustomerInvoice.TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency,'
        + 'Customer.CustomerNumber as CustomerNumber,CurrencyCode.Code as _CurrencyCode,'
        + 'CustomerInvoice.ExternalReference as ExternalReference'
        + '&expand=CustomerInvoice,CustomerInvoice.Customer.Info.DefaultEmail,CurrencyCode'
        + '&filter='
        + 'isnull(statuscode,0) ne 42104 and (customerinvoice.collectorstatuscode ne 42505 or '
        + 'isnull(customerinvoice.collectorstatuscode,0) eq 0) ';

    currentRunNumber: number = 0;
    private distributeEntityType: string = 'Models.Sales.CustomerInvoiceReminder';

    searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    saveactions: IUniSaveAction[] = [
         {
            label: 'Utsendelse',
            action: (done) => this.distributeReminders(done),
            main: true,
            disabled: !!this.remindersAll
        },
        {
            label: 'Slett valgte',
            action: (done) => this.deleteReminders(done),
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
        private route: ActivatedRoute,
        private reportService: ReportService,
        private statusService: StatusService
    ) {
        route.queryParams.subscribe((params) => {
            const runNumber = +params['runNumber'];
            if (runNumber) {
                this.currentRunNumber = runNumber;
            }

            this.setupReminderTable();
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

                        this.loadAll();
                    },
                    err => {
                        done('Feil ved sletting av purringer');
                        this.loadAll();
                        this.errorService.handle(err);
                    }
                );
            } else {
                done('Sletting ble avbrutt');
            }
        });
    }

    private distributeReminders(done: (message: string) => void) {
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
        let selectedWithDistribution = '';
        let selectedWithoutDistribution = [];
        const selectedIDs = [];
        let selectedIDsString = '';
        selected.forEach((item) => {
           selectedIDs.push(item.ID);
           selectedIDsString += item.ID + ',';
        })
        this.reportService.getEntitiesWithDistribution(selectedIDsString.slice(0, -1), this.distributeEntityType).subscribe((ids: List<number>) => {
            selectedIDs.forEach((id) => {
                if (ids.indexOf(id) > -1) {
                    selectedWithDistribution += id + ',';
                } else {
                    selectedWithoutDistribution.push(selected.find(x => x.ID == id));
                }
            });
            if (selectedWithDistribution.length > 0) {
                this.doDistribute(done, selectedWithDistribution.slice(0, -1));
                done('Purringer sendt');
            }
            if (selectedWithoutDistribution.length > 0) {
                this.openSendMethodModal(selectedWithoutDistribution, done);
            }
        });
    }

    private doDistribute(done, ids) {
        this.reportService.distributeList(ids, this.distributeEntityType).subscribe(() => {
            this.toastService.addToast(
                'Purring(er) er lagt i kø for utsendelse',
                ToastType.good,
                ToastTime.short);
            done;
        }, err => {
            this.errorService.handle(err);
            done;
        });
    }

    /*
    printonly = false -> sendEmail to selected in email list, sendPrint to selected in print list
    printonly = true -> sendPrint to all selected
    */
    private sendReminders(done: (message: string) => void, printonly, selected = []) {
        if (selected.length === 0)
         {
             selected = this.getSelected();
         }
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
            this.sendPrint(true, selected);
        } else {
            done('Purringer sendes');
            const selectedEmail = selected.filter(reminder => !!reminder.EmailAddress);
            const selectedPrint = selected.filter(reminder => selectedEmail.indexOf(reminder) < 0);
            this.sendEmail(done, selectedEmail);
            this.sendPrint(false, selectedPrint);
        }
    }

    loadAll(): Promise<any> {
        return new Promise((resolve, reject) => {
                Observable.forkJoin([
                    this.reminderService.GetAll(
                        'orderby=CustomerInvoiceID desc,ReminderNumber desc'
                    )
                ]).subscribe((res) => {
                    const reminders = res[0];

                    if (reminders.length === 0) {
                        resolve(false);
                    } else {
                        this.updateReminderList();
                        resolve(true);
                    }
                }, (err) => {
                    resolve(false);
                });
            }
        );
    }

    updateReminderList(reminders?) {
        let filter = '';
        if (this.modalMode && reminders) {
            this.currentRunNumber = reminders[0].RunNumber;
            filter = `and (`;
            reminders.forEach(reminder => {
                let id = reminder.ID;
                if (!id)
                {
                    id = reminder.CustomerInvoiceReminderID;
                }
                filter += ' ID eq ' + id + ' or';
            });
            filter = filter.slice(0, -2) + ')';
        }
        this.statisticsService.GetAllUnwrapped(this.reminderQuery + filter).subscribe(
            (remindersAll: CustomReminder[]) => {
                if (this.currentRunNumber > 0) {
                    this.remindersAll = remindersAll.map(reminder => {
                        reminder['_rowSelected'] = true;
                        return reminder;
                    });
                } else {
                    this.remindersAll = remindersAll;
                }
            }
        );
    }

    getSelected() {
        return this.table && this.table.getSelectedRows() || [];
    }

    getSelectedEmail() {
        return this.getSelected().filter(reminder => !!reminder.EmailAddress);
    }

    getSelectedPrint() {
        return this.getSelected().filter(reminder => !reminder.EmailAddress);
    }

    sendEmail(doneHandler?, emailReminders = []) {
        if (emailReminders.length === 0) {
            emailReminders = this.getSelectedEmail();
        }

        if (emailReminders.length === 0) { return; }
        this.reminderService.sendAction(emailReminders.map(reminder => reminder.ID)).subscribe(() => {
            this.loadAll();//Kan skippes..?

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

    sendPrint(all: boolean, printReminders: CustomReminder[] = []) {
        if (printReminders.length === 0) {
            printReminders = all ? this.getSelected() : this.getSelectedPrint();
        }

        if (printReminders.length === 0) { return; }
        this.reminderService.sendAction(printReminders.map(reminder => reminder.ID)).subscribe(() => {
            this.loadAll(); //Er det nødvendig å hente data etter Print? Ingen data er endret. Valgte rader blir u-valgt, det er vel den eneste forskjellen

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

    sendInvoicePrint(done?: (message: string) => void, selected?: CustomReminder[]) {
        if (!selected) {
            selected = this.getSelected();
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
        }
        if (done) { done('Sender purringer til print'); }
        this.reminderService.sendInvoicePrintAction(selected.map(reminder => reminder.ID)).subscribe(() => {
            this.loadAll(); //Kan skippes..?
        });
    }

    private setupReminderTable() {
        this.updateReminderList();

        const reminderNumberCol = new UniTableColumn('ReminderNumber', 'Purring nr');
        const jobNumberCol = new UniTableColumn('RunNumber', 'Purrejobb');
        const remindedDateCol = new UniTableColumn('RemindedDate', 'Purredato', UniTableColumnType.LocalDate);
        const invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr.');
        const dueDateCol = new UniTableColumn('DueDate', 'Forfallsdato', UniTableColumnType.LocalDate);
        // const customerCol = new UniTableColumn('CustomerName', 'Kunde')
        //     .setWidth('15rem')
        //     .setTemplate(row => `${row.CustomerNumber || ''} - ${row.CustomerName || ''}`);

        const customerNumberCol = new UniTableColumn('CustomerNumber', 'Kundenr')
            .setWidth('100px').setFilterOperator('startswith');

        const customerNameCol = new UniTableColumn('CustomerName', 'Kunde');

        const emailCol = new UniTableColumn('EmailAddress', 'E-post');

        const statusCol = new UniTableColumn('StatusCode', 'Status').setTemplate((reminder) => {
            return this.reminderService.getStatusText(reminder.StatusCode);
        });

        const currencyCodeCol = new UniTableColumn('_CurrencyCode', 'Valuta')
            .setVisible(false);

        const taxInclusiveAmountCol = new UniTableColumn(
            'TaxInclusiveAmountCurrency', 'Fakturasum', UniTableColumnType.Money
        ).setConditionalCls((item) => {
            return (+item.TaxInclusiveAmountCurrency >= 0)
                ? 'number-good' : 'number-bad';
        });

        const restAmountCol = new UniTableColumn('_RestAmountCurrency', 'Restsum', UniTableColumnType.Money)
            .setConditionalCls((item) => {
                return (+item._RestAmountCurrency <= 0) ? 'number-good' : 'number-bad';
            });

        const feeAmountCol = new UniTableColumn('ReminderFeeCurrency', 'Gebyr', UniTableColumnType.Money)
            .setConditionalCls((item) => {
                return (+item.RestAmountCurrency <= item.InterestFeeCurrency)
                    || (+item.RestAmountCurrency === 0) ? 'number-good' : 'number-bad';
            });

        const interestAmountCol = new UniTableColumn('InterestFeeCurrency', 'Renter', UniTableColumnType.Money)
            .setVisible(false)
            .setConditionalCls((item) => {
                return (+item.RestAmountCurrency === 0) ? 'number-good' : 'number-bad';
            });

        const lastSharingCol = new UniTableColumn('LastSharingType', 'Siste utsendelse', UniTableColumnType.Number)
            .setVisible(false)
            .setTemplate((reminder) => {
                return this.reminderService.getSharingTypeText(reminder.LastSharingType);
            })
            ;
        const sharingStatusCol = new UniTableColumn('LastSharingStatus', 'Status siste utsendelse', UniTableColumnType.Number)
            .setVisible(false)
            .setTemplate((reminder) => {
                return reminder.LastSharingStatus ? this.statusService.getSharingStatusText(reminder.LastSharingStatus) : '';
            });
        const sharingDateCol = new UniTableColumn('LastSharingDate', 'Siste utsendelsesdato', UniTableColumnType.LocalDate)
            .setVisible(false);

            const externalRefCol = new UniTableColumn('ExternalReference', 'Fakturaliste', UniTableColumnType.Text, false)
            .setFilterOperator('contains')
            .setVisible(false);

        if (this.modalMode) {
            jobNumberCol.visible = false;
        } else {
            invoiceNumberCol.setType(UniTableColumnType.Link);
            invoiceNumberCol.setLinkResolver(reminder => `/sales/invoices/${reminder.InvoiceID}`);

            customerNameCol.setType(UniTableColumnType.Link);
            customerNameCol.setLinkResolver(reminder => `/sales/customer/${reminder.CustomerID}`);
        }

        this.reminderTable = new UniTableConfig('sales.reminders.reminderSending', false, true, 25)
            .setSearchable(true)
            .setMultiRowSelect(true)
            .setContextMenu([{
                action: (rows) => this.openEditModal(rows),
                label: 'Rediger linje',
            }])
            .setColumns([
                jobNumberCol, reminderNumberCol, invoiceNumberCol, customerNumberCol, customerNameCol,
                emailCol, currencyCodeCol, taxInclusiveAmountCol, restAmountCol,
                feeAmountCol, interestAmountCol, dueDateCol, statusCol, remindedDateCol,
                lastSharingCol, sharingStatusCol, sharingDateCol, externalRefCol
            ]);

        if (this.currentRunNumber > 0) {
            const filter: ITableFilter = {
                field: 'RunNumber',
                operator: 'eq',
                value: this.currentRunNumber
            };
            this.reminderTable.filters = [filter];
        }
    }

    openEditModal(line) {
        this.modalService.open(UniReminderSendingEditModal, { data: { line: line } }).onClose.subscribe((newLine) => {
            // Replace old line with new line in the array. No need to get data again.
            if (newLine) {
                const index = this.remindersAll.findIndex(rem => rem.ID === newLine.ID);
                this.remindersAll.splice(index, 1, newLine);
                this.table.refreshTableData();
            }
        });
    }

    openSendMethodModal(selected: CustomReminder[], done) {
        this.modalService.open(UniReminderSendingMethodModal, {
            data: { reminders: selected }
        }).onClose.subscribe(res => {
            if (!res) {
                done('Utsendelse av purringer ble avbrutt');
                return;
            }
            if (res === 'SendEmailPrint') {
                this.sendReminders(done, false, selected);
            } else if (res === 'SendPrint') {
                this.sendReminders(done, true, selected);
            } else if (res === 'SendInvoicePrint') {
                this.sendInvoicePrint(done, selected);
            }
        });
    }
}
