import {Component, ViewChildren, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig, IContextMenuItem} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerInvoiceService} from '../../../../services/services';
import {StatusCodeCustomerInvoice} from '../../../../unientities';
import {Http, URLSearchParams} from '@angular/http';
import {AsyncPipe} from '@angular/common';

import {InvoicePaymentData} from '../../../../models/sales/InvoicePaymentData';
import {RegisterPaymentModal} from '../../../common/modals/registerPaymentModal';

@Component({
    selector: 'invoice-list',
    templateUrl: 'app/components/sales/invoice/list/invoiceList.html',
    directives: [UniTable, RegisterPaymentModal],
    providers: [CustomerInvoiceService],
    pipes: [AsyncPipe]
})

export class InvoiceList {
    @ViewChildren(UniTable) public table: any;

    private invoiceTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    @ViewChild(RegisterPaymentModal)
    private registerPaymentModal: RegisterPaymentModal;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private http: Http) {
        this.setupInvoiceTable();
    }

    private log(err) {
        alert(err._body);
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
            alert('Fakturer er betalt. Bilagsnummer: ' + journalEntry.JournalEntryNumber);
        }, (err) => {
            console.log('Error registering payment: ', err);
            this.log(err);
        });
    }

    private setupInvoiceTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params == null) {
                params = new URLSearchParams();
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
                // Possible to credit only if status = Invoiced || PartlyPaid || Paid
                if (rowModel.StatusCode == StatusCodeCustomerInvoice.Invoiced ||
                    rowModel.StatusCode == StatusCodeCustomerInvoice.PartlyPaid ||
                    rowModel.StatusCode == StatusCodeCustomerInvoice.Paid) {
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
            action: () => {}
        });

        contextMenuItems.push({
            label: 'Fakturer',
            action: (rowModel) => {
                alert('Fakturer action');

                this.customerInvoiceService.Transition(rowModel.ID, rowModel, 'invoice').subscribe(() => {
                    console.log('== Invoice TRANSITION OK ==');
                    alert('Fakturert OK');

                    // this.table.refresh(); //TODO Refresh and collect data. Not yet implemented fot uniTable
                }, (err) => {
                    console.log('Error fakturerer: ', err);
                    this.log(err);
                });
            },
            disabled: (rowModel) => {
                if (rowModel.TaxInclusiveAmount == 0) return true; //Must have saved at minimum 1 item related to the invoice
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
            disabled: (rowModel) => {
                return !rowModel._links.transitions.pay;
            }
        });

        contextMenuItems.push({
            label: 'Skriv ut',
            action: (rowModel) => {
                alert('Skriv ut action - Under construction');
            }
        });

        // Define columns to use in the table
        var invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', UniTableColumnType.Text).setWidth('10%');
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kundenavn', UniTableColumnType.Text);

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', UniTableColumnType.Date).setWidth('10%');
        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', UniTableColumnType.Date).setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var restAmountCol = new UniTableColumn('RestAmount', 'Restsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerInvoiceService.getStatusText(dataItem.StatusCode, dataItem.InvoiceType);
        });

        // Setup table
        this.invoiceTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCol, restAmountCol, creditedAmountCol, statusCol])
            .setContextMenu(contextMenuItems);
    }
}
