import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { ToastService, ToastType, ToastTime } from '../../../../../framework/uniToast/toastService';
import { ActivatedRoute } from '@angular/router';
import { SendEmail } from '../../../../models/sendEmail';
import { IUniSaveAction } from '../../../../../framework/save/save';
import { Observable, of } from 'rxjs';
import { LocalDate, CustomerInvoiceReminder, ReportDefinition, CompanySettings } from '../../../../unientities';
import { UniModalService, ConfirmActions, UniPreviewModal } from '../../../../../framework/uni-modal';
import { BehaviorSubject } from 'rxjs';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniReminderSendingEditModal } from './reminderSendingEditModal';
import {
    StatisticsService,
    ErrorService,
    ReportDefinitionService,
    CustomerInvoiceReminderService,
    EmailService,
    ReportService,
    StatusService,
    CompanySettingsService,
    ElsaPurchaseService
} from '../../../../services/services';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    INumberFormat,
    ITableFilter
} from '../../../../../framework/ui/unitable/index';
import { UniReminderSendingModal } from './reminderSendingModal';
import { List } from 'immutable';
import { catchError } from 'rxjs/operators';

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
export class ReminderSending implements OnInit {

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
        + `getlatestsharingtype('CustomerInvoiceReminder',ID) as LastSharingType,`
        + `getlatestsharingstatus('CustomerInvoiceReminder',ID) as LastSharingStatus,`
        + `getlatestsharingdate('CustomerInvoiceReminder',ID) as LastSharingDate,`
        + 'CustomerInvoice.TaxInclusiveAmountCurrency as TaxInclusiveAmountCurrency,'
        + 'Customer.CustomerNumber as CustomerNumber,CurrencyCode.Code as _CurrencyCode,'
        + 'CustomerInvoice.ExternalReference as ExternalReference'
        + '&expand=CustomerInvoice,CustomerInvoice.Customer.Info.DefaultEmail,CurrencyCode'
        + '&filter='
        + 'isnull(statuscode,0) ne 42104 and (customerinvoice.collectorstatuscode ne 42505 or '
        + 'isnull(customerinvoice.collectorstatuscode,0) eq 0) '
        + '&orderby=RunNumber DESC,CustomerInvoice.InvoiceNumber';

    currentRunNumber: number = 0;

    searchParams$: BehaviorSubject<any> = new BehaviorSubject({});
    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    saveactions: IUniSaveAction[] = null;
    companySettings: CompanySettings;

    debtCollectionProductPurchased = false;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private reminderService: CustomerInvoiceReminderService,
        private reportDefinitionService: ReportDefinitionService,
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private emailService: EmailService,
        private route: ActivatedRoute,
        private reportService: ReportService,
        private statusService: StatusService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {
        this.setupSaveActions();

        route.queryParams.subscribe((params) => {
            const runNumber = +params['runNumber'];
            if (runNumber) {
                this.currentRunNumber = runNumber;
            }

            this.setupReminderTable();
        });
    }

    ngOnInit() {
        // Commented out because we need to disable this feature for now. Then we'll have to refine it for later.
        // this.elsaPurchaseService.getPurchaseByProductName('Kreditorforeningen')
        //     .pipe(catchError(() => of(null)))
        //     .subscribe(product => {
        //         this.debtCollectionProductPurchased = !!product;
        //     });

        // get DefaultCustomerInvoiceReminderReportID from companysettings or fallback to getting report named 'Purring'
        this.companySettingsService.getCompanySettings()
            .subscribe(companySettings => {
                this.companySettings = companySettings;
                this.setupSaveActions();
            });
    }

    setupSaveActions() {
        this.saveactions = [
            {
                label: 'Send purringer',
                action: (done) => this.debtCollectionProductPurchased ?
                                    this.showProductPurchaseToast(done)
                                    : this.distributeReminders(done),
                main: true,
                disabled: !this.remindersAll
            },
            {
                label: 'Slett valgte',
                action: (done) => this.debtCollectionProductPurchased ? this.showProductPurchaseToast(done) : this.deleteReminders(done),
                disabled: !this.remindersAll
            }
        ];
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

                        this.updateReminderList();
                    },
                    err => {
                        done('Feil ved sletting av purringer');
                        this.updateReminderList();
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

        const selectedIDs = [];
        selected.forEach((item) => {
            selectedIDs.push(item.ID);
        });

        this.openSendMethodModal(selectedIDs, done);
    }

    openSendMethodModal(selected: CustomReminder[], done) {
        this.modalService.open(UniReminderSendingModal, {
            data: { reminders: selected }
        }).onClose.subscribe(res => {
            if (!res) {
                done('Utsendelse av purringer ble avbrutt');
                return;
            }

            done('Purringer sendes');
            this.toastService.addToast('Purringer sendes', ToastType.good, ToastTime.short);

            this.updateReminderList();
        });
    }

    updateReminderList(reminders?) {
        let filter = '';
        if (this.modalMode && reminders) {
            this.currentRunNumber = reminders[0].RunNumber;
            filter = `and (`;
            reminders.forEach(reminder => {
                let id = reminder.ID;
                if (!id) {
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
                this.setupSaveActions();
            }
        );
    }

    getSelected() {
        return this.table && this.table.getSelectedRows() || [];
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
            },
            {
                action: (rows) => this.openReport(rows),
                label: 'Forhåndsvis',
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

    showProductPurchaseToast(done) {
        this.toastService.addToast('Standard purrefunksjonalitet deaktivert',
            ToastType.info,
            10,
            'Du har en aktiv integrasjon for purring/inkasso. Standardfunksjonaliteten for disse funksjonene er derfor deaktivert.');

            done();
    }

    private openReport(reminder: any) {
        // get the report to used based on CompanySettings or name
        const reportDefinitionQuery = this.companySettings.DefaultCustomerInvoiceReminderReportID ?
            this.reportDefinitionService.Get(this.companySettings.DefaultCustomerInvoiceReminderReportID)
            : this.reportDefinitionService.getReportByName('Purring');

        reportDefinitionQuery
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe((report) => {
                report.parameters = [
                    {
                        Name: 'CustomerInvoiceID',
                        value: reminder.InvoiceID
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
