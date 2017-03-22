import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {StatusCodeCustomerInvoice, CustomerInvoice, LocalDate, CompanySettings, InvoicePaymentData} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ISummaryConfig} from '../../../common/summary/summary';
import {UniConfirmModal, ConfirmActions} from '../../../../../framework/modals/confirm';
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
    selector: 'invoice-list',
    templateUrl: './invoiceList.html'
})
export class InvoiceList implements OnInit {
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private invoiceTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private summaryConfig: ISummaryConfig[];
    private companySettings: CompanySettings;
    private baseCurrencyCode: string;

    private filterTabs: any[] = [
        { label: 'Alle' },
        { label: 'Kladd', statuscode: StatusCodeCustomerInvoice.Draft },
        { label: 'Fakturert', statuscode: StatusCodeCustomerInvoice.Invoiced },
        { label: 'Betalt', statuscode: StatusCodeCustomerInvoice.Paid }
    ];
    private activeTab: any = this.filterTabs[0];
    private
    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private numberFormat: NumberFormat,
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
                this.setupInvoiceTable();
                this.getGroupCounts();

            }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });

        this.summaryConfig = [
            { title: 'Totalsum', value: this.numberFormat.asMoney(0) },
            { title: 'Restsum', value: this.numberFormat.asMoney(0) },
            { title: 'Sum krediter', value: this.numberFormat.asMoney(0) },
        ];
    }

    private refreshData() {
        this.table.refreshTableData();
        this.getGroupCounts();
        this.getSummary();
    }

    private getGroupCounts() {
        this.customerInvoiceService.getGroupCounts().subscribe((counts) => {
            this.filterTabs.forEach((filter) => {
                if (counts.hasOwnProperty(filter.statuscode)) {
                    filter['count'] = counts[filter.statuscode];
                }
            });
        });
    }

    private getSummary() {
        this.customerInvoiceService.getInvoiceSummary('').subscribe(
            (summary) => {
                this.summaryConfig = [
                    { title: 'Totalsum', value: this.numberFormat.asMoney(summary.SumTotalAmount) },
                    { title: 'Restsum', value: this.numberFormat.asMoney(summary.SumRestAmount) },
                    { title: 'Sum kreditert', value: this.numberFormat.asMoney(summary.SumCreditedAmount) },
                ];
            },
            this.errorService.handle
        );
    }

    public createInvoice() {
        this.router.navigateByUrl('/sales/invoices/0');
    }

    public onReminder() {
        this.router.navigateByUrl('/sales/reminders');
    }

    public onFilterTabClick(tab) {
        this.activeTab = tab;
        if (tab.statuscode) {
            this.table.setFilters([{
                field: 'StatusCode',
                operator: 'eq',
                value: tab.statuscode,
                group: 1
            }]);
        } else {
            this.table.removeFilter('StatusCode');
        }
    }

    public onRegisteredPayment(modalData: any) {
        const warnToastID = this.toastService.addToast('Registrerer betaling', ToastType.warn);
        this.customerInvoiceService
            .ActionWithBody(modalData.id, modalData.invoice, 'payInvoice')
            .subscribe(
            (journalEntry) => {
                this.toastService.removeToast(warnToastID);
                const msg = 'Bilagsnummer: ' + journalEntry.JournalEntryNumber;
                this.toastService.addToast(`Faktura betalt`, ToastType.good, 10, msg);
                this.refreshData();
            },
            (err) => {
                this.toastService.removeToast(warnToastID);
                this.errorService.handle(err);
            }
            );
    }

    private setupInvoiceTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer,InvoiceReference,CurrencyCode');

            if (urlParams.get('orderby') === null) {
                urlParams.set('orderby', 'ID desc');
            }

            return this.customerInvoiceService.GetAllByUrlSearchParams(urlParams)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (rowModel) => {
                this.router.navigateByUrl(`/sales/invoices/${rowModel.ID}`);
            }
        });

        // TODO Foreløpig kun tilgjengelig for type Faktura, ikke for Kreditnota
        contextMenuItems.push({
            label: 'Krediter',
            action: (rowModel) => {
                this.customerInvoiceService.createCreditNoteFromInvoice(rowModel.ID)
                    .subscribe((data) => {
                        this.router.navigateByUrl('/sales/invoices/' + data.ID);
                    },
                    err => this.errorService.handle(err)
                    );
            },
            disabled: (rowModel) => {
                if (rowModel.InvoiceType === 1) {
                    return true;
                }

                if (rowModel.StatusCode === StatusCodeCustomerInvoice.Invoiced ||
                    rowModel.StatusCode === StatusCodeCustomerInvoice.PartlyPaid ||
                    rowModel.StatusCode === StatusCodeCustomerInvoice.Paid) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        contextMenuItems.push({
            label: 'Slett',
            action: (rowModel) => {
                this.customerInvoiceService.Remove(rowModel.ID, null).subscribe((res) => {
                    this.table.removeRow(rowModel['_originalIndex']);
                });
            },
            disabled: (rowModel) => {
                return rowModel.StatusCode !== StatusCodeCustomerInvoice.Draft;
            }
        });

        // Type er FAKTURA
        contextMenuItems.push({
            label: 'Fakturer',
            action: (rowModel) => {
                const warnToastID = this.toastService.addToast('Fakturerer', ToastType.warn);
                this.customerInvoiceService.Transition(rowModel.ID, rowModel, 'invoice').subscribe(() => {
                    this.toastService.removeToast(warnToastID);
                    this.toastService.addToast('Faktura fakturert', ToastType.good, 10);
                    this.refreshData();
                },
                    (err) => {
                        this.toastService.removeToast(warnToastID);
                        this.errorService.handle(err);
                    });
            },
            disabled: (rowModel) => {
                if (rowModel.TaxInclusiveAmount === 0 || rowModel.InvoiceType === 1) {
                    // Must have saved at minimum 1 item related to the invoice
                    return true;
                }
                return !rowModel._links.transitions.invoice;
            }
        });

        // Type er KREDITNOTA
        contextMenuItems.push({
            label: 'Krediter kreditnota',
            action: (rowModel) => {
                const warnToastID = this.toastService.addToast('Krediterer', ToastType.warn);
                this.customerInvoiceService.Transition(rowModel.ID, rowModel, 'invoice').subscribe(() => {
                    this.toastService.removeToast(warnToastID);
                    this.toastService.addToast('Kreditnota kreditert', ToastType.good, 10);
                    this.refreshData();
                },
                    (err) => {
                        this.toastService.removeToast(warnToastID);
                        this.errorService.handle(err);
                    });
            },
            disabled: (rowModel) => {
                if (rowModel.TaxInclusiveAmount === 0 || rowModel.InvoiceType === 0) {
                    // Must have saved at minimum 1 item related to the invoice
                    return true;
                }
                return !rowModel._links.transitions.invoice;
            }
        });

        contextMenuItems.push({
            label: 'Registrer betaling',
            action: (rowModel) => {
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

                this.registerPaymentModal.confirm(rowModel.ID, title, rowModel.CurrencyCode, rowModel.CurrencyExchangeRate, invoiceData);

            },

            // TODO: Benytt denne n�r _links fungerer
            // disabled: (rowModel) => {
            //    return !rowModel._links.transitions.pay;
            //    }

            disabled: (rowModel) => {
                if (rowModel.StatusCode === StatusCodeCustomerInvoice.Invoiced ||
                    rowModel.StatusCode === StatusCodeCustomerInvoice.PartlyPaid) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (invoice: CustomerInvoice) => {
                this.reportDefinitionService.getReportByName('Faktura id').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, invoice.ID);
                    }
                });
            }
        });

        contextMenuItems.push({
            label: 'Send på epost',
            action: (invoice: CustomerInvoice) => {
                let sendemail = new SendEmail();
                sendemail.EntityType = 'CustomerInvoice';
                sendemail.EntityID = invoice.ID;
                sendemail.CustomerID = invoice.CustomerID;
                sendemail.Subject = 'Faktura ' + (invoice.InvoiceNumber ? 'nr. ' + invoice.InvoiceNumber : 'kladd');
                sendemail.Message = 'Vedlagt finner du Faktura ' + (invoice.InvoiceNumber ? 'nr. ' + invoice.InvoiceNumber : 'kladd');

                this.sendEmailModal.openModal(sendemail);

                if (this.sendEmailModal.Changed.observers.length === 0) {
                    this.sendEmailModal.Changed.subscribe((email) => {
                        this.reportService.generateReportSendEmail('Faktura id', email);
                    });
                }
            }
        });

        // Define columns to use in the table
        let invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('contains');

        let customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            .setWidth('100px').setFilterOperator('contains')
            .setTemplate((invoice) => {
                return invoice.CustomerID ? `<a href='/#/sales/customer/${invoice.CustomerID}'>${invoice.Customer.CustomerNumber}</a>` : ``;
            });

        let customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text)
            .setWidth('15%').setFilterOperator('contains')
            .setTemplate((invoice) => {
                return invoice.CustomerID ? `<a href='/#/sales/customer/${invoice.CustomerID}'>${invoice.CustomerName}</a>` : ``;
            });

        let invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        let dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq')
            .setConditionalCls((item: CustomerInvoice) => {
                const paid = item.StatusCode === StatusCodeCustomerInvoice.Paid;
                return (paid || moment(item.PaymentDueDate).isAfter(moment()))
                    ? 'date-good' : 'date-bad';
            });

        let currencyCodeCol = new UniTableColumn('CurrencyCode.Code', 'Valuta', UniTableColumnType.Text)
            .setWidth('5%')
            .setFilterOperator('eq')
            .setVisible(false);

        let taxInclusiveAmountCurrencyCol = new UniTableColumn('TaxInclusiveAmountCurrency', 'Totalsum', UniTableColumnType.Money)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        let restAmountCurrencyCol = new UniTableColumn('RestAmountCurrency', 'Restsum', UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        let creditedAmountCurrencyCol = new UniTableColumn('CreditedAmountCurrency', 'Kreditert', UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.CreditedAmount >= 0) ? 'number-good' : 'number-bad';
            });

        let taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum ' + this.baseCurrencyCode, UniTableColumnType.Money)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setVisible(false)
            .setCls('column-align-right');


        let restAmountCol = new UniTableColumn('RestAmount', 'Restsum ' + this.baseCurrencyCode, UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setVisible(false)
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        let creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert ' + this.baseCurrencyCode, UniTableColumnType.Money)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setVisible(false)
            .setConditionalCls((item) => {
                return (+item.CreditedAmount >= 0) ? 'number-good' : 'number-bad';
            });

        const invoiceReferencesCol = new UniTableColumn('InvoiceReference', 'FakturaRef', UniTableColumnType.Number)
            // .setFilterOperator('startswith')
            .setWidth('6%')
            .setTemplate(invoice => {
                if (invoice.InvoiceReference && invoice.InvoiceReference.InvoiceNumber) {
                    return `<a href="#/sales/invoices/${invoice.InvoiceReference.ID}">
                                ${invoice.InvoiceReference.InvoiceNumber}
                            </a>`;
                }
            });

        let statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerInvoiceService.getStatusText(dataItem.StatusCode, dataItem.InvoiceType);
            });

        // Setup table
        this.invoiceTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumnMenuVisible(true)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol, currencyCodeCol,
                taxInclusiveAmountCurrencyCol, restAmountCurrencyCol, creditedAmountCurrencyCol, taxInclusiveAmountCol, restAmountCol,
                creditedAmountCol, invoiceReferencesCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    public onRowSelected(item) {
        this.router.navigateByUrl(`/sales/invoices/${item.ID}`);
    }
}
