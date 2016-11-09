import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerInvoiceService, ReportDefinitionService, UserService} from '../../../../services/services';
import {StatusCodeCustomerInvoice, CustomerInvoice, CompanySettings, User} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {SendEmailModal} from '../../../common/modals/sendEmailModal';
import {SendEmail} from '../../../../models/sendEmail';
import {AuthService} from '../../../../../framework/core/authService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {CompanySettingsService} from '../../../../services/common/CompanySettingsService';
import {ISummaryConfig} from '../../../common/summary/summary';

@Component({
    selector: 'invoice-list',
    templateUrl: 'app/components/sales/invoice/list/invoiceList.html'
})
export class InvoiceList implements OnInit {
    @ViewChild(RegisterPaymentModal) private registerPaymentModal: RegisterPaymentModal;
    @ViewChild(PreviewModal) private previewModal: PreviewModal;
    @ViewChild(UniTable) private table: UniTable;
    @ViewChild(SendEmailModal) private sendEmailModal: SendEmailModal;

    private invoiceTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;
    private summaryConfig: ISummaryConfig[];
    private user: User;
    private companySettings: CompanySettings;

    constructor(private uniHttpService: UniHttp,
                private router: Router,
                private customerInvoiceService: CustomerInvoiceService,
                private reportDefinitionService: ReportDefinitionService,
                private tabService: TabService,
                private authService: AuthService,
                private userService: UserService,
                private toastService: ToastService,
                private companySettingsService: CompanySettingsService) {

        this.setupInvoiceTable();
        this.tabService.addTab({ url: '/sales/invoices', name: 'Faktura', active: true, moduleID: UniModules.Invoices });
        this.summaryConfig = [
            {title: 'Totalsum', value: '0'},
            {title: 'Restsum', value: '0'},
            {title: 'Sum krediter', value: '0'},
        ];
    }

    private log(err) {
        alert(err._body);
    }

    public ngOnInit() {
        this.setupInvoiceTable();
        this.onFiltersChange('');
    }

    public createInvoice() {
        this.router.navigateByUrl('/sales/invoices/0');
    }

    public onRegisteredPayment(modalData: any) {
        this.customerInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
            // TODO: Decide what to do here. Popup message or navigate to journalentry ??
            // this.router.navigateByUrl('/sales/invoices/' + invoice.ID);
            alert('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber);
            this.table.refreshTableData();
        }, (err) => {
            console.log('Error registering payment: ', err);
            this.log(err);
        });
    }

    private setupInvoiceTable() {
        this.companySettingsService.Get(1, ['DefaultEmail'])
            .subscribe(settings => this.companySettings = settings,
                err => {
                    console.log('Error retrieving company settings data: ', err);
                    this.toastService.addToast('En feil oppsto ved henting av firmainnstillinger: ' + JSON.stringify(err), ToastType.bad);
                });

        let jwt = this.authService.jwtDecoded;
        this.userService.Get(`?filter=GlobalIdentity eq '${jwt.nameid}'`).subscribe((users) => {
            this.user = users[0];
        });

        this.lookupFunction = (urlParams: URLSearchParams) => {
            urlParams = urlParams || new URLSearchParams();
            urlParams.set('expand', 'Customer,Customer.Info,Customer.Info.DefaultEmail,InvoiceReference');

            if (urlParams.get('orderby') === null) {
                urlParams.set('orderby', 'PaymentDueDate');
            }

            return this.customerInvoiceService.GetAllByUrlSearchParams(urlParams);
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
                    (err) => {
                        console.log('Error creating credit note: ', err);
                        this.log(err);
                    }
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
                this.customerInvoiceService.Transition(rowModel.ID, rowModel, 'invoice').subscribe(() => {
                    console.log('== Invoice TRANSITION OK ==');
                    alert('Fakturert OK');
                    this.table.refreshTableData();
                }, (err) => {
                    console.log('Error fakturerer: ', err);
                    this.log(err);
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
                this.customerInvoiceService.Transition(rowModel.ID, rowModel, 'invoice').subscribe(() => {
                    console.log('== kreditnota Kreditert OK ==');
                    alert('Kreditnota kreditert  OK');
                    this.table.refreshTableData();
                }, (err) => {
                    console.log('Error fakturerer: ', err);
                    this.log(err);
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
                sendemail.Subject = 'Faktura ' + (invoice.InvoiceNumber ? 'nr. ' + invoice.InvoiceNumber : 'kladd');
                sendemail.EmailAddress = invoice.Customer.Info.DefaultEmail ? invoice.Customer.Info.DefaultEmail.EmailAddress : '';
                sendemail.CopyAddress = this.user.Email;
                sendemail.Message = 'Vedlagt finner du Faktura ' + (invoice.InvoiceNumber ? 'nr. ' + invoice.InvoiceNumber : 'kladd') +
                                    '\n\nMed vennlig hilsen\n' +
                                    this.companySettings.CompanyName + '\n' +
                                    this.user.DisplayName + '\n' +
                                    (this.companySettings.DefaultEmail ? this.companySettings.DefaultEmail.EmailAddress : '');

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

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.Date)
            .setWidth('8%').setFilterOperator('eq');

        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.Date)
            .setWidth('8%').setFilterOperator('eq');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('8%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var restAmountCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setWidth('10%')
            .setFilterOperator('eq')
            .setFormat('{0:n}')
            .setCls('column-align-right');

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

    public onFiltersChange(filter: string) {
        this.customerInvoiceService.getInvoiceSummary(filter)
            .subscribe((summary) => {
                this.summaryConfig = [
                    {title: 'Totalsum', value: summary.SumTotalAmount},
                    {title: 'Restsum', value: summary.SumRestAmount},
                    {title: 'Sum kreditert', value: summary.SumCreditedAmount},
                ];
            });
    }
}
