import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UniHttp } from '../../../framework/core/http/http';
import {
    CustomerInvoice,
    CustomerInvoiceItem,
    StatusCodeCustomerInvoice,
    LocalDate,
    InvoicePaymentData,
    ReportDefinition,
    StatusCodeCustomerInvoiceReminder
} from '../../unientities';
import { SendEmail } from '../../models/sendEmail';
import { ToastService, ToastType } from '../../../framework/uniToast/toastService';
import { ITickerActionOverride } from '../../services/common/uniTickerService';
import { CompanySettingsService } from '../common/companySettingsService';
import { EHFService } from '../common/EHFService';
import { EmailService } from '../common/emailService';
import { UniModalService } from '../../../framework/uni-modal/modalService';
import { UniSendEmailModal } from '../../../framework/uni-modal/modals/sendEmailModal';
import { UniRegisterPaymentModal } from '../../../framework/uni-modal/modals/registerPaymentModal';
import { BizHttp } from '../../../framework/core/http/BizHttp';
import { Observable } from 'rxjs/Observable';
import { ErrorService } from '../common/errorService';
import * as moment from 'moment';
import { ConfirmActions } from '@uni-framework/uni-modal/interfaces';
import { ReportDefinitionService} from '../../services/reports/reportDefinitionService';
import {ReportDefinitionParameterService} from '../../services/reports/reportDefinitionParameterService';
import {ReportTypeEnum} from '@app/models/reportTypeEnum';

@Injectable()
export class CustomerInvoiceService extends BizHttp<CustomerInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert' },
        // { Code: StatusCodeCustomerInvoice.Reminded, Text: 'Purret'}, // TODO: Add when available from backend
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt' }
    ];

    public statusTypesCredit: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt(Kreditnota)' },
        { Code: StatusCodeCustomerInvoice.Paid, Text: 'Betalt(Kreditnota)' },
    ];

    public actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'invoice_registerpayment',
            ExecuteActionHandler: (selectedRows) => this.onRegisterPayment(selectedRows),
            CheckActionIsDisabled: (selectedRow) => this.onCheckRegisterPaymentDisabled(selectedRow)
        },
        {
            Code: 'invoice_print',
            AfterExecuteActionHandler: (selectedRows) => this.onAfterPrintInvoice(selectedRows)
        },
        {
            Code: 'invoice_invoiceprint',
            ExecuteActionHandler: (selectedRows) => this.onSendInvoicePrint(selectedRows),
            CheckActionIsDisabled: (selectedRows) => !this.ehfService.isActivated("NETSPRINT")
        },
        {
            Code: 'invoice_createcreditnote',
            CheckActionIsDisabled: (selectedRow) => this.onCheckCreateCreditNoteDisabled(selectedRow),
            ExecuteActionHandler: (selectedRows) => this.onCreateCreditNote(selectedRows)
        },
        {
            Code: 'invoice_creditcreditnote',
            CheckActionIsDisabled: (selectedRow) => this.onCheckCreditCreditNoteDisabled(selectedRow)
        },
        {
            Code: 'invoice_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        },
        {
            Code: 'invoice_delete',
            CheckActionIsDisabled: (selectedRow) => selectedRow.CustomerInvoiceStatusCode !== StatusCodeCustomerInvoice.Draft,
            ExecuteActionHandler: (selectedRows) => this.deleteInvoices(selectedRows)
        }
    ];

    private printStatusPrinted: string = '200';

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private router: Router,
        private toastService: ToastService,
        private companySettingsService: CompanySettingsService,
        private modalService: UniModalService,
        private emailService: EmailService,
        private reportDefinitionService: ReportDefinitionService,
        private reportDefinitionParameterService: ReportDefinitionParameterService,
        private ehfService: EHFService
    ) {
        super(http);
        this.relativeURL = CustomerInvoice.RelativeUrl;
        this.entityType = CustomerInvoice.EntityType;
    }

    public createInvoice() {
        this.router.navigateByUrl('/sales/invoices/0');
    }

    public onReminder() {
        // TODO: Legg inn mulighet for eksterne linker i filtre? Litt sært..

        this.router.navigateByUrl('/sales/reminders');
    }

    public onAfterPrintInvoice(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const invoice = selectedRows[0];
            this.setPrintStatus(invoice.ID, this.printStatusPrinted)
                .subscribe((printStatus) => {
                    resolve();
                }, err => {
                    reject(err);
                    this.errorService.handle(err);
                }
            );
        });
    }

    public onCheckRegisterPaymentDisabled(selectedRow: any): boolean {
        if (!selectedRow) {
            return true;
        }

        const row = selectedRow;
        const isInvoiced = row.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.Invoiced;
        const isPartlyPaid = row.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.PartlyPaid;

        if (isInvoiced || isPartlyPaid) {
            return false;
        } else {
            return true;
        }
    }

    public onRegisterPayment(selectedRows: Array<any>): Promise<any> {
        const row = selectedRows[0];

        if (!row) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // get invoice from API - the data from the ticker may only be partial
            this.Get(row.ID, ['CurrencyCode', 'CustomerInvoiceReminders']).subscribe(invoice => {
                const title = `Register betaling: Faktura ${invoice.InvoiceNumber || ''} - `
                    + `${invoice.CustomerName || ''}`;

                const reminders = invoice.CustomerInvoiceReminders || [];
                let amount = invoice.RestAmount || 0;
                let amountCurrency = invoice.RestAmountCurrency || 0;

                reminders.forEach(reminder => {
                    if (reminder.StatusCode < StatusCodeCustomerInvoiceReminder.Paid) {
                        amount += reminder.ReminderFee;
                        amountCurrency += reminder.ReminderFeeCurrency;
                    }
                });

                const paymentData: InvoicePaymentData = {
                    Amount: amount,
                    AmountCurrency: amountCurrency,
                    BankChargeAmount: 0,
                    CurrencyCodeID: invoice.CurrencyCodeID,
                    CurrencyExchangeRate: 0,
                    PaymentDate: new LocalDate(new Date()),
                    AgioAccountID: null,
                    BankChargeAccountID: 0,
                    AgioAmount: 0
                };

                const modal = this.modalService.open(UniRegisterPaymentModal, {
                    data: paymentData,
                    header: title,
                    modalConfig: {
                        currencyExchangeRate: invoice.CurrencyExchangeRate,
                        entityName: 'CustomerInvoice',
                        currencyCode: invoice.CurrencyCode.Code
                    }
                });

                modal.onClose.subscribe((payment) => {
                    if (!payment) {
                        resolve();
                        return;
                    }

                    this.ActionWithBody(invoice.ID, payment, 'payInvoice').subscribe(
                        res => {
                            this.toastService.addToast(
                                'Faktura er betalt. Bilagsnummer: ' + res.JournalEntryNumber,
                                ToastType.good,
                                5
                            );
                            resolve();
                        },
                        err => {
                            this.errorService.handle(err);
                            resolve();
                        }
                    );
                });
            });
        });
    }

    public onCheckCreateCreditNoteDisabled(selectedRow: any): boolean {
        const rowModel = selectedRow;

        if (rowModel.CustomerInvoiceInvoiceType === 1) {
            return true;
        }

        if (rowModel.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.Invoiced ||
            rowModel.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.PartlyPaid ||
            rowModel.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.Paid) {
            return false;
        } else {
            return true;
        }
    }

    public onCreateCreditNote(selectedRows: Array<any>): Promise<any> {
        const rowModel = selectedRows[0];

        return new Promise((resolve, reject) => {
        this.createCreditNoteFromInvoice(rowModel.ID)
            .subscribe((data) => {
                resolve();

                setTimeout(() => {
                    this.router.navigateByUrl('/sales/invoices/' + data.ID);
                });
            },
            err => {
                this.errorService.handle(err);
                reject(err);
            });
        });
    }

    public onCheckCreditCreditNoteDisabled(selectedRow: any): boolean {
        const rowModel = selectedRow;

        if (rowModel.CustomerInvoiceTaxInclusiveAmount === 0 || rowModel.CustomerInvoiceInvoiceType === 0) {
            // Must have saved at minimum 1 item related to the invoice
            return true;
        }

        return !rowModel._links.transitions.invoice;
    }

    private deleteInvoices(selectedRows: Array<any>): Promise<any> {
        const invoice = selectedRows[0];
        return new Promise((resolve, reject) => {
            this.modalService.confirm({
                header: 'Slette faktura',
                message: 'Vil du slette denne fakturaen?',
                buttonLabels: {
                    accept: 'Slett',
                    cancel: 'Avbryt'
                }
            }).onClose.subscribe(answer => {
                if (answer === ConfirmActions.ACCEPT) {
                    this.Remove(invoice.ID, null).subscribe(
                        res => resolve(),
                        err => {
                            this.errorService.handle(err);
                            resolve();
                        }
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    public onSendInvoicePrint(selectedRows: Array<any>): Promise<any> {
        const invoice = selectedRows[0];
        return new Promise((resolve, reject) => {
            this.sendInvoicePrint(invoice.ID).subscribe(jobCreated => {
                resolve(jobCreated)
            }, err => {
                this.errorService.handle(err);
                reject();
            });
        });
    }

    public onSendEmail(selectedRows: Array<any>): Promise<any> {
        const invoice = selectedRows[0];
        return new Promise((resolve, reject) => {
            this.companySettingsService.Get(1)
                .subscribe(settings => {
                    Observable.forkJoin(
                        this.reportDefinitionService.getReportByID(
                            settings['DefaultCustomerInvoiceReportID']
                        ),
                        this.reportDefinitionParameterService.GetAll(
                            'filter=ReportDefinitionId eq ' + settings['DefaultCustomerInvoiceReportID']
                        )
                    ).subscribe(data => {
                        if (data[0] && data[1]) {
                            const defaultInvoiceReportForm = data[0];
                            const defaultReportParameterName = data[1][0].Name;

                            const model = new SendEmail();
                            model.EmailAddress = invoice.CustomerInvoiceEmailAddress || '';
                            model.EntityType = 'CustomerInvoice';
                            model.EntityID = invoice.ID;
                            model.CustomerID = invoice.CustomerID;

                            const invoiceNumber = (invoice.InvoiceNumber)
                                ? ` nr. ${invoice.InvoiceNumber}`
                                : 'kladd';

                            model.Subject = 'Faktura' + invoiceNumber;
                            model.Message = 'Vedlagt finner du faktura' + invoiceNumber;

                            const value = defaultReportParameterName === 'Id'
                                ? invoice[defaultReportParameterName.toUpperCase()]
                                : invoice[defaultReportParameterName];
                            const parameters = [{ Name: defaultReportParameterName, value: value }];

                            this.modalService.open(UniSendEmailModal, {
                                data: {model: model, reportType: ReportTypeEnum.INVOICE, entity: invoice, parameters}
                            }).onClose.subscribe(email => {
                                if (email) {
                                    this.emailService.sendEmailWithReportAttachment(
                                        email.model.selectedForm.Name,
                                        email.model.sendEmail,
                                        email.parameters
                                    );
                                }
                                resolve();
                            }, err => {
                                this.errorService.handle(err);
                                resolve();
                            });
                        }
                    }, err => this.errorService.handle(err));
                }, err => this.errorService.handle(err)
            );
        });
    }

    public getGroupCounts() {
        const route = '?model=customerinvoice&select=count(id),statuscode&filter=isnull(deleted,0) eq 0';
        return this.http.asGET()
            .usingStatisticsDomain()
            .withEndPoint(route)
            .send()
            .map((res) => {
                const data = (res.json() || {}).Data || [];
                return data.reduce((counts, group) => {
                    if (group.CustomerInvoiceStatusCode) {
                        counts[group.CustomerInvoiceStatusCode] = group.countid;
                    }
                    return counts;
                }, {});
            });
    }

    public newCustomerInvoice(): Promise<CustomerInvoice> {
        return new Promise(resolve => {
            this.GetNewEntity([], CustomerInvoice.EntityType).subscribe((invoice: CustomerInvoice) => {
                invoice.InvoiceDate = new LocalDate(Date());

                resolve(invoice);
            }, err => this.errorService.handle(err));
        });
    }

    public calculateInvoiceSummary(invoiceItems: Array<CustomerInvoiceItem>): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(invoiceItems)
            .withEndPoint(this.relativeURL + '?action=calculate-invoice-summary')
            .send()
            .map(response => response.json());
    }

    public setPrintStatus(invoiceId: number, printStatus: string): Observable<any> {
        return super.PutAction(invoiceId, 'set-customer-invoice-printstatus', 'ID=' + invoiceId + '&printStatus=' + printStatus);
    }

    public validateVippsCustomer(invoiceId: number): Observable<any> {
        return super.GetAction(invoiceId, 'validate-vipps-user');
    }

    public sendInvoicePrint(currentInvoiceID: number): Observable<any> {
        return Observable.create(obs => {
            return super.PutAction(currentInvoiceID, 'send-invoice-print').subscribe(jobCreated => {
                this.toastService.addToast(
                    jobCreated ? 'Faktura sendt til fakturaprint jobb' : 'Faktura feilet å lage fakturaprint jobb',
                    jobCreated ? ToastType.good : ToastType.bad,
                    5
                );
                obs.complete(jobCreated);
            }, err => this.errorService.handle(err));
        });
    }

    public SendInvoiceToVippsWithText(invoice: Object): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPOST()
            .usingBusinessDomain()
            .withBody(invoice)
            .withEndPoint(this.relativeURL + '?action=send-invoice-to-vipps')
            .send()
            .map(response => response.json());
    }

    public getInvoiceByInvoiceNumber(invoiceNumber: string): Observable<any> {
        return this.GetAll(
            'filter=InvoiceNumber eq ' + invoiceNumber,
            ['JournalEntry', 'JournalEntry.Lines', 'JournalEntry.Lines.Account', 'JournalEntry.Lines.SubAccount']
        );
    }

    public getInvoiceSummary(odatafilter: string): Observable<any> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + '?action=get-customer-invoice-summary&odataFilter=' + odatafilter)
            .send()
            .map(response => response.json());
    }

    public matchInvoicesManual(customerInvoiceIDs: number[], paymentID: number): Observable<any> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(customerInvoiceIDs)
            .withEndPoint(this.relativeURL + '?action=match-invoices-manual&paymentID=' + paymentID)
            .send()
            .map(response => response.json());
    }

    public createCreditNoteFromInvoice(currentInvoiceID: number): Observable<any> {
        return super.PutAction(currentInvoiceID, 'create-credit-draft-invoice');
    }

    public getStatusText(statusCode: number, invoiceType: number = 0): string {
        const dict = (invoiceType === 0) ? this.statusTypes : this.statusTypesCredit;
        const statusType = dict.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }
}
