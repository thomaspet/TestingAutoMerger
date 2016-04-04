import {Component, ViewChildren, Input} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {CustomerQuoteService, CustomerQuoteItemService} from "../../../../services/services";
import {CustomerQuote, CustomerQuoteItem} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'quote-item-list',
    templateUrl: 'app/components/sales/quote/details/quoteItemList.html',
    directives: [UniTable],
    providers: [CustomerQuoteService]
})
export class QuoteItemList {
    @Input() quoteItems: any; 
    @ViewChildren(UniTable) tables: any;
    
    quoteItemTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private customerQouteService: CustomerQuoteService) {
        this.setupQuoteItemTable();
    }
    
    setupQuoteItemTable() {
        /*
        // Define columns to use in the table
        var numberCol = new UniTableColumn('SupplierNumber', 'Leverandørnr', 'number').setWidth('15%');
        var nameCol = new UniTableColumn('Info.Name', 'Navn', 'string');
        var orgNoCol = new UniTableColumn('Orgnumber', 'Orgnr', 'string').setWidth('15%');
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {
            this.router.navigateByUrl('/sales/supplier/details/' + selectedItem.ID);
        }

        // Setup table
        this.supplierTable = new UniTableBuilder('suppliers?expand=Info', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(numberCol, nameCol, orgNoCol); 
        */               
    }
}