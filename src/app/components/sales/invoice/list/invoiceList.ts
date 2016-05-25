import {Component, ViewChildren} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerInvoiceService} from '../../../../services/services';
import {CustomerInvoice} from '../../../../unientities';
import {Http, URLSearchParams} from '@angular/http';
import {AsyncPipe} from '@angular/common';

declare var jQuery;

@Component({
    selector: 'invoice-list',
    templateUrl: 'app/components/sales/invoice/list/invoiceList.html',
    directives: [UniTable],
    providers: [CustomerInvoiceService],
    pipes: [AsyncPipe]
})

export class InvoiceList {
    @ViewChildren(UniTable) public table: any;

    private invoiceTable: UniTableConfig;
    private selectedinvoice: CustomerInvoice;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private uniHttpService: UniHttp,
        private router: Router,
        private customerInvoiceService: CustomerInvoiceService,
        private http: Http) {
        this.setupInvoiceTable();
    }

    log(err) {
        alert(err._body);
    }

    createInvoice() {
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

    private onRowSelected(event) {
        this.router.navigateByUrl('/sales/invoice/details/' + event.rowModel.ID);
    };

    private setupInvoiceTable() {
        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params == null)
                params = new URLSearchParams();

            return this.customerInvoiceService.GetAllByUrlSearchParams(params);
        };

        // Context menu
        let contextMenuItems = [];
        contextMenuItems.push({
            label: 'Rediger',
            action: (rowModel) => {
                this.log('Rediger action');
                this.router.navigateByUrl(`/sales/invoice/details/${rowModel.ID}`);
                // console.log('Delete action called. RowModel:', rowModel);
            }
        });

        contextMenuItems.push({
            label: 'Krediter',
            action: (rowModel) => {
                this.log('Krediter action');
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
                // This is were we would check _links to see if the user has access to this operation etc.
                return false;
            }
        });

        contextMenuItems.push({
            label: 'Slett',
            action: (rowModel) => {
                this.log('Delete action');
            },
            disabled: (rowModel) => {
                return rowModel['Deleted'];
            }
        });

        contextMenuItems.push({
            label: '-------------',
        });


        contextMenuItems.push({
            label: 'Fakturer',
            action: (rowModel) => {
                this.log('Fakturer action');
            },
            disabled: (rowModel) => {
                return !rowModel._links.invoice;
            }
        });

        var self = this;

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

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerInvoiceService.getStatusText(dataItem.StatusCode);
        });

        // Setup table
        this.invoiceTable = new UniTableConfig(false, true)
            .setPageSize(25)
            .setColumns([invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol,
                taxInclusiveAmountCol, restAmountCol, statusCol])
            .setContextMenuItems(contextMenuItems);

            //.setContextMenuItems([
            //    {
            //        label: 'Rediger',
            //        action: invoice => this.router.navigateByUrl(`/sales/invoice/details/${invoice.ID}`)
            //    },
            //    {
            //        label: 'Krediter',
            //        action: window.alert('Tildel invoice action')
            //        //disabled: supplierInvoice => supplierInvoice._links.assign //TODO
            //    },
            //    {
            //        label: 'Slett',
            //        action: window.alert('Slett invoice action')
            //        //disabled: supplierInvoice => supplierInvoice._links.assign //TODO
            //    },
            //    {
            //        label: '---------------'
            //    },
            //    {
            //        label: 'Fakturer',
            //        action: window.alert('Fakturer invoice action')
            //        //disabled: supplierInvoice => supplierInvoice._links.assign //TODO
            //    },
            //    {
            //        label: 'Registerer betaling',
            //        action: window.alert('Registerer betaling invoice action')
            //        //action: supplierInvoice => this.registerPaymentModal.openModal()
            //    },
            //    {
            //        label: '---------------'
            //    },
            //    {
            //        label: 'Skriv ut',
            //        action: window.alert('Skriv ut invoice action')
            //        //disabled: supplierInvoice => supplierInvoice._links.assign //TODO
            //    }
            //]);


        //// Define callback function for row clicks
        //var selectCallback = (selectedItem) => {
        //    this.router.navigateByUrl('/sales/invoice/details/' + selectedItem.ID);
        //};

        //// Setup table
        //this.invoiceTable = new UniTableBuilder('invoices', false)
        //    .setFilterable(false)
        //    .setSelectCallback(selectCallback)
        //    .setExpand('Customer')
        //    .setPageSize(25)
        //    .addColumns(invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol, taxInclusiveAmountCol, statusCol)
        //    .setOrderBy('PaymentDueDate', 'desc')
        //    .addCommands({
        //        name: 'ContextMenu', text: '...', click: (function (event) {
        //            event.preventDefault();
        //            var dataItem = this.dataItem(jQuery(event.currentTarget).closest('tr'));

        //            if (dataItem !== null && dataItem.ID !== null) {
        //                self.selectedinvoice = dataItem;
        //                alert('Kontekst meny er under utvikling.');
        //            }
        //            else {
        //                console.log('Error in selecting the SupplierInvoices');
        //            }
        //        })
        //    });

    }
}
