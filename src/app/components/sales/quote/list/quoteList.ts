import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerQuoteService} from '../../../../services/services';
import {CustomerQuote} from '../../../../unientities';

declare var jQuery;

@Component({
    selector: 'quote-list',
    templateUrl: 'app/components/sales/quote/list/quoteList.html',
    directives: [UniTable],
    providers: [CustomerQuoteService]
})
export class QuoteList {
    @ViewChildren(UniTable) public tables: any;

    private quoteTable: UniTableBuilder;
    private selectedquote: CustomerQuote;

   
   
    constructor(private uniHttpService: UniHttp, private router: Router, private customerQuoteService: CustomerQuoteService) {
        this.setupQuoteTable();
    }



    public createQuote() {        
        var q = this.customerQuoteService.newCustomerQuote();  

        this.customerQuoteService.Post(q)
            .subscribe(
            (data) => {
                console.log('Tilbud opprettet, id: ' + data.ID);
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            },
            (err) => console.log('Error creating quote: ', err)
            );
    }

    private setupQuoteTable() {
        var self = this;

        // Define columns to use in the table
        //var idCol = new UniTableColumn('ID', 'ID', 'number').setWidth('10%');

        var quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', 'string').setWidth('10%');
        // quoteNumber.setTemplate('#var quoteNumber; if(!QuoteNumber) {quoteNumber = ' - '}  # #= quoteNumber #');

        //var customeridCol = new UniTableColumn('CustomerID', 'KundeId', 'string');

        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', 'string')
            .setNullable(true)
            .setWidth('10%');

        var customerNameCol = new UniTableColumn('CustomerName', 'KundeNavn', 'string');

        var quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('10%');

        var validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', 'date')
            .setFormat('{0: dd.MM.yyyy}')
            .setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', 'number')
            .setWidth('10%')
            .setFormat('{0:n}')
            .setClass('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', 'number').setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerQuoteService.getStatusText(dataItem.StatusCode);
        });

        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/quote/details/' + selectedItem.ID);
        };

        // Setup table
        this.quoteTable = new UniTableBuilder('quotes', false)
            .setFilterable(false)
            .setSelectCallback(selectCallback)
            .setExpand('Customer')
            .setPageSize(25)
            .addColumns( quoteNumberCol, customerNumberCol, customerNameCol, quoteDateCol, validUntilDateCol, taxInclusiveAmountCol, statusCol)
            .setOrderBy('QuoteDate')
            .addCommands({
                name: 'ContextMenu', text: '...', click: (function (event) {
                    event.preventDefault();
                    var dataItem = this.dataItem(jQuery(event.currentTarget).closest('tr'));

                    if (dataItem !== null && dataItem.ID !== null) {
                        self.selectedquote = dataItem;
                        alert('Kontekst meny er under utvikling.');
                    }
                    else {
                        console.log('Error in selecting the SupplierInvoices');
                    }
                })
            });

        // TODO context menu:        
        //.addCommands({
        //    name: 'ContextMenu', text: '...', click: (function (event) {
        //        event.preventDefault();
        //        var dataItem = this.dataItem(jQuery(event.currentTarget).closest('tr'));

        //        if (dataItem !== null && dataItem.ID !== null) {
        //            self.selectedSupplierInvoice = dataItem;
        //            self._router.navigateByUrl('/accounting/journalentry/supplierinvoices/' + dataItem.ID);
        //        }
        //        else
        //            console.log('Error in selecting the SupplierInvoices');
        //    })
        //});
                               
    }
}
