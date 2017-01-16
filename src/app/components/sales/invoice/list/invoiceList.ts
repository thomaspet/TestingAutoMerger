import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {StatusCodeCustomerInvoice, CustomerInvoice} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ISummaryConfig} from '../../../common/summary/summary';
import moment from 'moment';
import {
    CustomerInvoiceService,
    ReportDefinitionService,
    NumberFormat,
    ErrorService,
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

    private filterTabs: any[] = [
        {label: 'Alle'},
        {label: 'Kladd', statuscode: StatusCodeCustomerInvoice.Draft},
        {label: 'Fakturert', statuscode: StatusCodeCustomerInvoice.Invoiced},
        {label: 'Betalt', statuscode: StatusCodeCustomerInvoice.Paid},
    ];
    private activeTab: any = this.filterTabs[0];

    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private reportDefinitionService: ReportDefinitionService,
        private tabService: TabService,
        private toastService: ToastService,
        private numberFormat: NumberFormat,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.setupInvoiceTable();
        this.getGroupCounts();

        this.tabService.addTab({
            url: '/sales/invoices',
            name: 'Faktura',
            active: true,
            moduleID: UniModules.Invoices
        });

        this.summaryConfig = [
            {title: 'Totalsum', value: this.numberFormat.asMoney(0)},
            {title: 'Restsum', value: this.numberFormat.asMoney(0)},
            {title: 'Sum krediter', value: this.numberFormat.asMoney(0)},
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
                    {title: 'Totalsum', value: this.numberFormat.asMoney(summary.SumTotalAmount)},
                    {title: 'Restsum', value: this.numberFormat.asMoney(summary.SumRestAmount)},
                    {title: 'Sum kreditert', value: this.numberFormat.asMoney(summary.SumCreditedAmount)},
                ];
            },
            this.errorService.handle
        );
    }

    public createInvoice() {
        this.router.navigateByUrl('/sales/invoices/0');
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
            urlParams.set('expand', 'Customer,InvoiceReference');

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
                    PaymentDate: new Date()
                };

                this.registerPaymentModal.openModal(rowModel.ID, title, invoiceData);
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
                        this.reportDefinitionService.generateReportSendEmail('Faktura id', email);
                    });
                }
            }
        });

        // Define columns to use in the table
        var invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text)
            // .setWidth('10%')
            .setFilterOperator('contains');

        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text)
            // .setWidth('10%')
            .setFilterOperator('contains');

        var customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains');

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq');

        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.LocalDate)
            .setWidth('8%').setFilterOperator('eq')
            .setConditionalCls((item: CustomerInvoice) => {
                const paid = item.StatusCode === StatusCodeCustomerInvoice.Paid;
                return (paid || moment(item.PaymentDueDate).isAfter(moment()))
                    ? 'date-good' : 'date-bad';
            });

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.TaxInclusiveAmount >= 0)
                    ? 'number-good' : 'number-bad';
            })
            .setCls('column-align-right');

        var restAmountCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setConditionalCls((item) => {
                return (+item.RestAmount >= 0) ? 'number-good' : 'number-bad';
            });

        var creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
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

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number)
            .setWidth('15%')
            .setFilterable(false)
            .setTemplate((dataItem) => {
                return this.customerInvoiceService.getStatusText(dataItem.StatusCode, dataItem.InvoiceType);
            });

        // Setup table
        this.invoiceTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setSearchable(true)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCol, restAmountCol, creditedAmountCol, invoiceReferencesCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    public onRowSelected(item) {
        this.router.navigateByUrl(`/sales/invoices/${item.ID}`);
    }
}
