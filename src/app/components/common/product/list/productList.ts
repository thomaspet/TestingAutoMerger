import {Component, ViewChildren} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {ComponentInstruction, RouteParams, Router} from 'angular2/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {ProductService} from "../../../../services/services";
import {Product} from "../../../../unientities";

declare var jQuery;

@Component({
    selector: 'product-list',
    templateUrl: 'app/components/common/product/list/productList.html',
    directives: [UniTable],
    providers: [ProductService]
})
export class ProductList {
    @ViewChildren(UniTable) tables: any;
    
    productTable: UniTableBuilder;
 
    constructor(private uniHttpService: UniHttp, private router: Router, private productService: ProductService) {
        this.setupProductTable();
    }
    
    createProduct() { 
        this.router.navigateByUrl('/products/details/0');
    }

    getStatusText() {
        return "foo";
    }

    setupProductTable() {
        // Define columns to use in the table
        var partNameCol = new UniTableColumn('PartName', 'Produktnr', 'string').setWidth('15%');
        var nameCol = new UniTableColumn('Name', 'Navn', 'string');
        var priceCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva', 'number')
                            .setWidth('15%')
                            .setFormat('{0:n}')
                            .setClass('column-align-right');
        var statusCol = new UniTableColumn('StatusCode', 'Status', 'number').setWidth('15%');
        statusCol.setTemplate("#var statusText; if(!StatusCode) {statusText = 'Kladd'} else {statusText = 'Aktiv'} # #= statusText #");
        
                
                
        // Define callback function for row clicks
        var selectCallback = (selectedItem) => {            
            this.router.navigateByUrl('/products/details/' + selectedItem.ID);
        }

        // Setup table
        this.productTable = new UniTableBuilder('products', false)
            .setSelectCallback(selectCallback)
            .setFilterable(false)
            .setPageSize(25)
            .addColumns(partNameCol, nameCol, priceCol, statusCol);            
    }
}