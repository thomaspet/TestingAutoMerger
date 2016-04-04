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
        
        // Define columns to use in the table
        var numberCol = new UniTableColumn('ID', 'ID', 'number').setWidth('15%');
        var nameCol = new UniTableColumn('CustomerID', 'Kundeid', 'string');
        //var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', 'string').setWidth('15%');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/quote/details/' + selectedItem.ID);
        }

        // Setup table
        this.quoteTable = new UniTableBuilder('quotes', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(numberCol, nameCol);//, orgNoCol); 
                       
    }
}