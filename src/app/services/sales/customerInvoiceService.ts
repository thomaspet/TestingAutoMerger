import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UniHttp } from '../../../framework/core/http/http';
import {
    CustomerInvoice,
    StatusCodeCustomerInvoice,
    LocalDate,
    InvoicePaymentData,
    StatusCodeCustomerInvoiceReminder,
    JournalEntry,
} from '../../unientities';
import { ToastService, ToastType } from '../../../framework/uniToast/toastService';
import { ITickerActionOverride } from '../../services/common/uniTickerService';
import { UniModalService } from '../../../framework/uni-modal/modalService';
import { TofEmailModal } from '@uni-framework/uni-modal/modals/tof-email-modal/tof-email-modal';
import { UniRegisterPaymentModal } from '../../../framework/uni-modal/modals/registerPaymentModal';
import { BizHttp, RequestMethod } from '@uni-framework/core/http';
import { Observable } from 'rxjs';
import { ErrorService } from '../common/errorService';
import { ConfirmActions } from '@uni-framework/uni-modal/interfaces';
import { ReportTypeEnum } from '@app/models/reportTypeEnum';

@Injectable()
export class CustomerInvoiceService extends BizHttp<CustomerInvoice> {

    // TODO: To be retrieved from database schema shared.Status instead?
    public statusTypes: Array<any> = [
        { Code: StatusCodeCustomerInvoice.Draft, Text: 'Kladd' },
        { Code: StatusCodeCustomerInvoice.Invoiced, Text: 'Fakturert' },
        // { Code: StatusCodeCustomerInvoice.Reminded, Text: 'Purret'}, // TODO: Add when available from backend
        { Code: StatusCodeCustomerInvoice.PartlyPaid, Text: 'Delbetalt' },
        { Code: StatusCodeCustomerInvoice.Sold, Text: 'Solgt' },
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
        },
    ];

    constructor(
        http: UniHttp,
        private errorService: ErrorService,
        private router: Router,
        private toastService: ToastService,
        private modalService: UniModalService,
    ) {
        super(http);
        this.relativeURL = CustomerInvoice.RelativeUrl;
        this.entityType = CustomerInvoice.EntityType;
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
                        amount += reminder.RestAmount;
                        amountCurrency += reminder.RestAmountCurrency;
                    }
                });

                const paymentData = <InvoicePaymentData> {
                    Amount: amount,
                    AmountCurrency: amountCurrency,
                    BankChargeAmount: 0,
                    CurrencyCodeID: invoice.CurrencyCodeID,
                    CurrencyExchangeRate: 0,
                    PaymentDate: new LocalDate(new Date()),
                    AgioAccountID: null,
                    BankChargeAccountID: 0,
                    AgioAmount: 0,
                    PaymentID: null,
                    DimensionsID: null
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

    public getFileList(id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('/files/CustomerInvoice/' + id)
            .send()
            .map(response => response.body);
    }

    public payInvoice(id: number, payment: InvoicePaymentData): Observable<JournalEntry> {
        return this.ActionWithBody(id, payment, 'payInvoice');
    }
    public payInvoiceWithNumberSeriesTaskID(id: number, payment: InvoicePaymentData, taskID: number) {
        return this.ActionWithBody(id, payment, 'pay-invoice-with-number-series-task-id', RequestMethod.Put,
            taskID != null ? 'numberseriestaskid=' + taskID.toString() : null);
    }

    public payInvoices(data: { id: number, payment: InvoicePaymentData, numberSeriesTaskID: number }[]): Observable<JournalEntry[]> {
        if (!data.length) { return Observable.of([]); }

        return Observable.forkJoin(data.map(d => this.payInvoiceWithNumberSeriesTaskID(d.id, d.payment, d.numberSeriesTaskID)));
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

    public onSendEmail(selectedRows: Array<any>): Promise<any> {
        const invoice = selectedRows[0];
        this.modalService.open(TofEmailModal, {
            data: {
                entity: invoice,
                entityType: 'CustomerInvoice',
                reportType: ReportTypeEnum.INVOICE
            }
        });

        return Promise.resolve();
    }


    public createInvoiceJournalEntryDraftAction(id: number): Observable<any> {
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${id}?action=create-invoice-journalentrydraft`)
            .send()
            .map(response => response.body);
    }

    public setPrintStatus(invoiceId: number, printStatus: string): Observable<any> {
        return super.PutAction(invoiceId, 'set-customer-invoice-printstatus', 'ID=' + invoiceId + '&printStatus=' + printStatus);
    }

    public matchInvoicesManual(customerInvoiceIDs: number[], paymentID: number): Observable<any> {
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withBody(customerInvoiceIDs)
            .withEndPoint(this.relativeURL + '?action=match-invoices-manual&paymentID=' + paymentID)
            .send()
            .map(response => response.body);
    }

    public createCreditNoteFromInvoice(currentInvoiceID: number): Observable<any> {
        return super.PutAction(currentInvoiceID, 'create-credit-draft-invoice');
    }

    public getStatusText(statusCode: number, invoiceType: number = 0): string {
        const dict = (invoiceType === 0) ? this.statusTypes : this.statusTypesCredit;
        const statusType = dict.find(x => x.Code === statusCode);
        return statusType ? statusType.Text : '';
    }

    public getAprilaOffer(invoiceId: number): Observable<any> {
        return super.GetAction(invoiceId, 'get-aprila-offer');
    }

    public acceptDeclineAprilaOffer(invoiceId: number, orderId: string, acceptOffer: boolean, offer: any): Observable<any> {
        return super.ActionWithBody(invoiceId, offer, 'accept-decline-aprila-offer',
            RequestMethod.Post, `aprilaOrderId=${orderId}&acceptOffer=${acceptOffer}`);
    }

    public fulfillAprilaOffer(invoiceId: number): Observable<any> {
        return super.Action(invoiceId, 'fulfill-aprila-offer',
            null, RequestMethod.Post);
    }

    public createAprilaCreditNote(invoiceId: number) {
        return super.PostAction(invoiceId, 'create-aprila-credit-note');
    }
}
