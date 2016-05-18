import {Component, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router-deprecated';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerQuoteService} from '../../../../services/services';
import {CustomerQuote} from '../../../../unientities';
import {Http, URLSearchParams} from '@angular/http';
import {AsyncPipe} from '@angular/common';

declare var jQuery;

@Component({
    selector: 'quote-list',
    templateUrl: 'app/components/sales/quote/list/quoteList.html',
    directives: [UniTable],
    providers: [CustomerQuoteService],
    pipes: [AsyncPipe]
})
export class QuoteList {
    @ViewChild(UniTable) public table: any;

    private quoteTable: UniTableConfig;
    private selectedquote: CustomerQuote;
    private lookupFunction: (urlParams: URLSearchParams) => any;
   
   
    constructor(private uniHttpService: UniHttp, private router: Router, private customerQuoteService: CustomerQuoteService, private http: Http) {
        this.setupQuoteTable();
    }

    log(err) {
        alert(err._body);
    }

    public createQuote() {        
        this.customerQuoteService.newCustomerQuote().then(quote => {
            this.customerQuoteService.Post(quote)
                .subscribe(
                    (data) => {
                        this.router.navigateByUrl('/sales/quote/details/' + data.ID);        
                    },
                    (err) => { 
                        console.log('Error creating quote: ', err);
                        this.log(err);
                    }
                );
        });  
    }

    private onRowSelected (event) {
        this.router.navigateByUrl('/sales/quote/details/' + event.rowModel.ID);
    };

    private setupQuoteTable() {
        var self = this;

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;
            
            if (params == null)
                params = new URLSearchParams();
                        
            return this.customerQuoteService.GetAllByUrlSearchParams(params);
        };

        // Define columns to use in the table        
        var quoteNumberCol = new UniTableColumn('QuoteNumber', 'Tilbudsnr', UniTableColumnType.Text)
            .setWidth('10%');
            
        var customerNumberCol = new UniTableColumn('Customer.CustomerNumber', 'Kundenr', UniTableColumnType.Text).setWidth('10%');
        var customerNameCol = new UniTableColumn('CustomerName', 'Kunde', UniTableColumnType.Text);
        var quoteDateCol = new UniTableColumn('QuoteDate', 'Tilbudsdato', UniTableColumnType.Date).setWidth('10%');
        var validUntilDateCol = new UniTableColumn('ValidUntilDate', 'Gyldighetsdato', UniTableColumnType.Date).setWidth('10%');
        var taxInclusiveAmountCol = new UniTableColumn('TaxInclusiveAmount', 'Totalsum', UniTableColumnType.Number)
            .setWidth('10%')
            .setFormat('{0:n}')
            .setCls('column-align-right');

        var statusCol = new UniTableColumn('StatusCode', 'Status', UniTableColumnType.Number).setWidth('15%');
        statusCol.setTemplate((dataItem) => {
            return this.customerQuoteService.getStatusText(dataItem.StatusCode);
        });

        // Setup table
        this.quoteTable = new UniTableConfig(false, true, 20)            
            .setPageSize(25)
            .setColumns([quoteNumberCol, customerNumberCol, customerNameCol, quoteDateCol, validUntilDateCol, taxInclusiveAmountCol, statusCol]);
            
        //TODO: Add contextmenuitems                       
    }
}
