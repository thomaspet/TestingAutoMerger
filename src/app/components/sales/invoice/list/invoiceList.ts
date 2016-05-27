import {Component, ViewChildren} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerInvoiceService} from '../../../../services/services';
import {CustomerInvoice} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'invoice-list',
    templateUrl: 'app/components/sales/invoice/list/invoiceList.html',
    directives: [UniTable],
    providers: [CustomerInvoiceService]
})
export class InvoiceList {
    @ViewChildren(UniTable) public tables: any;

    private invoiceTable: UniTableBuilder;
    private selectedinvoice: CustomerInvoice;
   
    constructor(private uniHttpService: UniHttp, private router: Router, private customerInvoiceService: CustomerInvoiceService) {
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

    private setupInvoiceTable() {
        var self = this;

        // Define columns to use in the table
        var invoiceNumberCol = new UniTableColumn('InvoiceNumber', 'Fakturanr', 'string').setWidth('10%');
       
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', 'string')
            .setNullable(true)
            .setWidth('10%');

        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', 'string');

        var invoiceDateCol = new UniTableColumn('InvoiceDate', 'Fakturadato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('10%');

        var dueDateCol = new UniTableColumn('PaymentDueDate', 'Forfallsdato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', 'number')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setClass('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', 'number').setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerInvoiceService.getStatusText(dataItem.StatusCode); 
        });
        
        var restAmountCol = new UniTableColumn('RestAmount', 'Restbeløp', 'number')
            .setEditable(false)
            .setNullable(false)
            .setClass('column-align-right')
            .setFormat('{0:n}');

        var creditedAmountCol = new UniTableColumn('CreditedAmount', 'Kreditert', 'number')
            .setEditable(false)
            .setNullable(false)
            .setClass('column-align-right')
            .setFormat('{0:n}');

        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/invoice/details/' + selectedItem.ID);
        };

        // Setup table
        this.invoiceTable = new UniTableBuilder('invoices', false)
            .setFilterable(false)
            .setSelectCallback(selectCallback)
            .setExpand('Customer')
            .setPageSize(25)
            .addColumns( invoiceNumberCol, customerNumberCol, customerNameCol, invoiceDateCol, dueDateCol, taxInclusiveAmountCol, restAmountCol, creditedAmountCol, statusCol)
            .setOrderBy('PaymentDueDate','desc')
            .addCommands({
                name: 'ContextMenu', text: '...', click: (function (event) {
                    event.preventDefault();
                    var dataItem = this.dataItem(jQuery(event.currentTarget).closest('tr'));

                    if (dataItem !== null && dataItem.ID !== null) {
                        self.selectedinvoice = dataItem;
                        alert('Kontekst meny er under utvikling.');
                    }
                    else {
                        console.log('Error in selecting the SupplierInvoices');
                    }
                })
            });
                               
    }
}
