import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerQuoteService} from "../../../../services/services";
import {CustomerQuote} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'quote-list',
    templateUrl: 'app/components/sales/quote/list/quoteList.html',
    directives: [UniTable],
    providers: [CustomerQuoteService]
})
export class QuoteList {
    @ViewChildren(UniTable) tables: any;

    quoteTable: UniTableBuilder;


    constructor(private uniHttpService: UniHttp, private router: Router, private customerQouteService: CustomerQuoteService) {
        this.setupQuoteTable();
    }

    createQuote() {        
        /*     
        this.customerQouteService.GetNewEntity().subscribe((s)=> {
            this.customerQouteService.Post(s)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/quote/details/' + data.ID);        
                    },
                    (err) => console.log('Error creating quote: ', err)
                );        
        });    */
        
        /* OLD VERSION */
        var cq = new CustomerQuote();

        this.customerQouteService.Post(cq)
            .subscribe(
            (data) => {
                console.log('Tilbud opprettet, id: ' + data.ID);
                this.router.navigateByUrl('/sales/quote/details/' + data.ID);
            },
            (err) => console.log('Error creating quote: ', err)
            );
    }

    setupQuoteTable() {
        var self = this;

        // Define columns to use in the table
        var idCol = new UniTableColumn('ID', 'ID', 'number').setWidth('10%');

        var quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', 'string');
        //quoteNumber.setTemplate("#var quoteNumber; if(!QuoteNumber) {quoteNumber = ' - '}  # #= quoteNumber #");

        var customeridCol = new UniTableColumn('CustomerID', 'KundeId', 'string');

        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', 'string')
            .setNullable(true);

        var customerNameCol = new UniTableColumn('CustomerName', 'KundeNavn', 'string');

        var quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', 'date')
            .setFormat("{0: dd.MM.yyyy}")
            .setWidth('10%');

        var validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', 'date')
            .setFormat("{0: dd.MM.yyyy}")
            .setWidth('10%');

        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', 'number')
            .setWidth('15%')
            .setFormat("{0:n}")
            .setClass('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', 'number').setWidth('15%');
        statusCol.setTemplate("#var statusText; if(!StatusCode) {statusText = 'Ukjent'} else {statusText = 'Aktiv'} # #= statusText #");

        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/quote/details/' + selectedItem.ID);
        }

        var deleteCallback = (deletedItem) => {
            console.log('Deleted: ');
            console.log(deletedItem);
        };

        // Setup table
        this.quoteTable = new UniTableBuilder('quotes', false)
            .setFilterable(false)
            .setSelectCallback(selectCallback)
            .setExpand("Customer")
            //.setDeleteCallback(deleteCallback)
            .setPageSize(25)
            .addColumns(idCol, quoteNumberCol, customeridCol, customerNumberCol, customerNameCol, quoteDateCol, validUntilDateCol, taxInclusiveAmountCol, statusCol);

//TODO context menu:        
            //.addCommands({
            //    name: 'ContextMenu', text: '...', click: (function (event) {
            //        event.preventDefault();
            //        var dataItem = this.dataItem(jQuery(event.currentTarget).closest("tr"));

            //        if (dataItem !== null && dataItem.ID !== null) {
            //            self.selectedSupplierInvoice = dataItem;
            //            self._router.navigateByUrl("/accounting/journalentry/supplierinvoices/" + dataItem.ID);
            //        }
            //        else
            //            console.log("Error in selecting the SupplierInvoices");
            //    })
            //});
                               
    }
}