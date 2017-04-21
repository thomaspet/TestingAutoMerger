import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {StatusCodeCustomerInvoice, CustomerInvoice, LocalDate, CompanySettings, InvoicePaymentData} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
import {ITickerActionOverride, TickerAction, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import * as moment from 'moment';
import {
    CustomerInvoiceService,
    ReportDefinitionService,
    NumberFormat,
    ErrorService,
    CompanySettingsService,
    ReportService
} from '../../../../services/services';

@Component({
    selector: 'invoice-list2',
    templateUrl: './invoiceList2.html'
})
export class InvoiceList2 implements OnInit {
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private actionOverrides: Array<ITickerActionOverride> = [
        {
            Code: 'invoice_registerpayment',
            ExecuteActionHandler: (selectedRows) => this.onRegisterPayment(selectedRows),
            CheckActionIsDisabled: (selectedRows) => this.onCheckRegisterPaymentDisabled(selectedRows)
        },
        {
            Code: 'invoice_print',
            AfterExecuteActionHandler: (selectedRows) => this.onAfterPrintInvoice(selectedRows)
        },
        {
            Code: 'invoice_createcreditnote',
            CheckActionIsDisabled: (selectedRows) => this.onCheckCreateCreditNoteDisabled(selectedRows),
            ExecuteActionHandler: (selectedRows) => this.onCreateCreditNote(selectedRows)
        },
        {
            Code: 'invoice_creditcreditnote',
            CheckActionIsDisabled: (selectedRows) => this.onCheckCreditCreditNoteDisabled(selectedRows)
        },
        {
            Code: 'invoice_sendemail',
            ExecuteActionHandler: (selectedRows) => this.onSendEmail(selectedRows)
        }
    ];

    private columnOverrides: Array<ITickerColumnOverride> = [
        {
            Field: 'StatusCode',
            Template: (dataItem) => {
                let statusText: string = this.customerInvoiceService.getStatusText(dataItem.CustomerInvoiceStatusCode, dataItem.CustomerInvoiceInvoiceType);
                if (dataItem.CustomerInvoiceCollectorStatusCode === 42501) {
                    statusText = 'Purret';
                }
                if (dataItem.CustomerInvoiceCollectorStatusCode === 42502) {
                    statusText = 'Inkasso';
                }
                return statusText;
            }
        }
    ];

    private tickercode: string = 'invoice_list';

    private companySettings: CompanySettings;
    private baseCurrencyCode: string;
    private printStatusPrinted: string = '200';

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private reportService: ReportService
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                    this.baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code;
                }
            }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });
    }

    public createInvoice() {
        this.router.navigateByUrl('/sales/invoices/0');
    }

    public onReminder() {
        // TODO: Legg inn mulighet for eksterne linker i filtre? Litt sært..

        this.router.navigateByUrl('/sales/reminders');
    }

    private onAfterPrintInvoice(selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            let invoice = selectedRows[0];
            this.customerInvoiceService
                .setPrintStatus(invoice.ID, this.printStatusPrinted)
                    .subscribe((printStatus) => {
                        resolve();
                    }, err => {
                        reject(err);
                        this.errorService.handle(err);
                    }
                );
        });
    }

    public onCheckRegisterPaymentDisabled(selectedRows: Array<any>): boolean {
        if (!selectedRows || selectedRows.length !== 1) {
            return true;
        }

        let row = selectedRows[0];

        if (row.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.Invoiced ||
            row.CustomerInvoiceStatusCode === StatusCodeCustomerInvoice.PartlyPaid) {
            return false;
        } else {
            return true;
        }
    }

    public onRegisterPayment(selectedRows: Array<any>): Promise<any> {
        let row = selectedRows[0];

        if (!row) {
            return Promise.resolve();
        } else {
            return new Promise<any>((resolve, reject) => {
                // get invoice from API - the data from the ticker may only be partial
                this.customerInvoiceService.Get(row.ID, ['CurrencyCode'])
                    .subscribe(invoice => {
                        let rowModel = invoice;
                        const title = `Register betaling, Faktura ${rowModel.InvoiceNumber || ''}, ${rowModel.CustomerName || ''}`;
                        const invoiceData: InvoicePaymentData = {
                            Amount: rowModel.RestAmount,
                            AmountCurrency: rowModel.CurrencyCodeID == this.companySettings.BaseCurrencyCodeID ? rowModel.RestAmount : rowModel.RestAmountCurrency,
                            BankChargeAmount: 0,
                            CurrencyCodeID: rowModel.CurrencyCodeID,
                            CurrencyExchangeRate: 0,
                            PaymentDate: new LocalDate(Date()),
                            AgioAccountID: null,
                            BankChargeAccountID: 0,
                            AgioAmount: 0
                        };

                        return this.registerPaymentModal.confirm(rowModel.ID, title, rowModel.CurrencyCode, rowModel.CurrencyExchangeRate, 'CustomerInvoice', invoiceData).then(res => {
                            if (res.status === ConfirmActions.ACCEPT) {
                                this.customerInvoiceService.ActionWithBody(res.id, res.model, 'payInvoice').subscribe((journalEntry) => {
                                    this.toastService.addToast('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber, ToastType.good, 5);
                                    resolve();
                                }, (err) => {
                                    this.errorService.handle(err);
                                    reject(err);
                                });
                            } else {
                                resolve();
                            }
                        });
                    }, err => {
                        reject(err);
                        this.errorService.handle(err);
                    }
                );
            });
        }
    }

    private onCheckCreateCreditNoteDisabled(selectedRows: Array<any>): boolean {
        let rowModel = selectedRows[0];

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

    private onCreateCreditNote(selectedRows: Array<any>): Promise<any> {
        let rowModel = selectedRows[0];

        return new Promise((resolve, reject) => {
        this.customerInvoiceService.createCreditNoteFromInvoice(rowModel.ID)
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

    private onCheckCreditCreditNoteDisabled(selectedRows: Array<any>): boolean {
        let rowModel = selectedRows[0];

        if (rowModel.CustomerInvoiceTaxInclusiveAmount === 0 || rowModel.CustomerInvoiceInvoiceType === 0) {
            // Must have saved at minimum 1 item related to the invoice
            return true;
        }

        return !rowModel._links.transitions.invoice;
    }

    private onSendEmail(selectedRows: Array<any>): Promise<any> {
        let invoice = selectedRows[0];

        return new Promise((resolve, reject) => {
            let sendemail = new SendEmail();
            sendemail.EntityType = 'CustomerInvoice';
            sendemail.EntityID = invoice.ID;
            sendemail.CustomerID = invoice.CustomerID;
            sendemail.Subject = 'Faktura ' + (invoice.CustomerInvoiceInvoiceNumber ? 'nr. ' + invoice.CustomerInvoiceInvoiceNumber : 'kladd');
            sendemail.Message = 'Vedlagt finner du Faktura ' + (invoice.CustomerInvoiceInvoiceNumber ? 'nr. ' + invoice.CustomerInvoiceInvoiceNumber : 'kladd');

            this.sendEmailModal.openModal(sendemail);

            if (this.sendEmailModal.Changed.observers.length === 0) {
                this.sendEmailModal.Changed.subscribe((email) => {
                    this.reportService.generateReportSendEmail('Faktura id', email);
                    resolve();
                });
            }
        });
    }
}
