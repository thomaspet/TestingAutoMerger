import {Component, ViewChild, OnInit} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerInvoiceService, ReportDefinitionService} from '../../../../services/services';
import {StatusCodeCustomerInvoice, CustomerInvoice} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {AsyncPipe} from '@angular/common';
import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {InvoiceSummary} from '../../../../models/accounting/InvoiceSummary';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';
import {PreviewModal} from '../../../reports/modals/preview/previewModal';

@Component({
    selector: 'invoice-list',
    templateUrl: 'app/components/sales/invoice/list/invoiceList.html',
    directives: [UniTable, RegisterPaymentModal, PreviewModal],
    providers: [CustomerInvoiceService, ReportDefinitionService],
    pipes: [AsyncPipe]
})

export class InvoiceList implements OnInit {
    private invoiceTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    @ViewChild(RegisterPaymentModal)
    private registerPaymentModal: RegisterPaymentModal;

    @ViewChild(PreviewModal) private previewModal: PreviewModal;

    @ViewChild(UniTable) private table: UniTable;

    private summaryData: InvoiceSummary;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private reportDefinitionService: ReportDefinitionService) {

        this.setupInvoiceTable();
    }

    private log(err) {
        alert(err._body);
    }

    public ngOnInit() {
        this.setupInvoiceTable();
        this.onFiltersChange('');
    }

    public createInvoice() {
        this.customerInvoiceService.newCustomerInvoice().then(invoice => {
            this.customerInvoiceService.Post(invoice)
                .subscribe(
                (data) => {
                    this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
                },
                (err) => {
                    console.log('Error creating invoice: ', err);
                    this.log(err);
                }
                );
        });
    }

    public onRegisteredPayment(modalData: any) {

        this.customerInvoiceService.ActionWithBody(modalData.id, modalData.invoice, 'payInvoice').subscribe((journalEntry) => {
            // TODO: Decide what to do here. Popup message or navigate to journalentry ??
            // this.router.navigateByUrl('/sales/invoice/details/' + invoice.ID);
            alert('Faktura er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber);
            this.table.refreshTableData();
        }, (err) => {
            console.log('Error registering payment: ', err);
            this.log(err);
        });
    }

    private setupInvoiceTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            if (params.get('orderby') === null) {
                params.set('orderby', 'PaymentDueDate');
            }

            return this.customerInvoiceService.GetAllByUrlSearchParams(params);
        };

        // Context menu
        let contextMenuItems: IContextMenuItem[] = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (rowModel) => {
                this.router.navigateByUrl(`/sales/invoice/details/${rowModel.ID}`);
            }
        });

        contextMenuItems.push({
            label: 'Krediter',
            action: (rowModel) => {
                this.customerInvoiceService.createCreditNoteFromInvoice(rowModel.ID)
                    .subscribe((data) => {
                        this.router.navigateByUrl('/sales/invoice/details/' + data.ID);
                    },
                    (err) => {
                        console.log('Error creating credit note: ', err);
                        this.log(err);
                    }
                    );
            },
            disabled: (rowModel) => {
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
                alert('Delete action - Under construction');
            },
            disabled: (rowModel) => {
                return rowModel['Deleted'];
            }
        });

        contextMenuItems.push({
            label: '-------------',
            action: () => { }
        });

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
                if (rowModel.TaxInclusiveAmount === 0) {
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

            //TODO: Benytt denne når _links fungerer
            //disabled: (rowModel) => {
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
            label: '-------------',
            action: () => { }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (invoice: CustomerInvoice) => {
                this.reportDefinitionService.getReportByName('Faktura Uten Giro').subscribe((report) => {
                    if (report) {
                        this.previewModal.openWithId(report, invoice.ID);
                        // report.parameters = [{Name: 'Id', value: invoice.ID}]; // TEST DOWNLOAD
                        // this.reportDefinitionService.generateReportPdf(report);                                        
                    }
                });
            }
        });

        // Define columns to use in the table
        var invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text).setWidth('10%').setFilterOperator('contains');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%').setFilterOperator('contains');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text).setFilterOperator('contains');

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.Date).setWidth('10%').setFilterOperator('eq');
        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.Date).setWidth('10%').setFilterOperator('eq');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
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
                taxInclusiveAmountCol, restAmountCol, creditedAmountCol, statusCol])
            .setContextMenu(contextMenuItems);
    }

    private onRowSelected(item) {
        this.router.navigateByUrl(`/sales/invoice/details/${item.ID}`);
    }

    public onFiltersChange(filter: string) {
        this.customerInvoiceService
            .getInvoiceSummary(filter)
            .subscribe((summary) => {
                this.summaryData = summary;
            },
            (err) => {
                console.log('Error retrieving summarydata:', err);
                this.summaryData = null;
            });
    }
}
