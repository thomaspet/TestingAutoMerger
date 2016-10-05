import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {ProductService} from '../../../../services/services';
import {TabService, UniModules} from "../../../layout/navbar/tabstrip/tabService";

declare var jQuery;

@Component({
    selector: 'product-list',
    templateUrl: 'app/components/common/product/list/productList.html',
    directives: [UniTable],
    providers: [ProductService]
})
export class ProductList {
    private productTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private uniHttpService: UniHttp, private router: Router, private productService: ProductService, private tabService: TabService) {
        this.setupProductTable();
        this.tabService.addTab({ name: "Produkter", url: "/products/list/", active: true, moduleID: UniModules.Products });
    }

    private createProduct() {
        this.router.navigateByUrl('/products/0');
    }

    private onRowSelected (event) {
        this.router.navigateByUrl('/products/' + event.rowModel.ID);
    };

    private setupProductTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            return this.productService.GetAllByUrlSearchParams(params);
        };

        // Define columns to use in the table
        var partNameCol = new UniTableColumn('PartName', 'Produktnr',  UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        var nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text).setFilterOperator('contains');
        var priceExVatCol = new UniTableColumn('PriceExVat', 'Utpris eks. mva',  UniTableColumnType.Number).setFilterOperator('eq')
                            .setWidth('15%')
                            .setFormat('{0:n}')
                            .setCls('column-align-right');
        var priceIncVatCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva',  UniTableColumnType.Number).setFilterOperator('eq')
                            .setWidth('15%')
                            .setFormat('{0:n}')
                            .setCls('column-align-right');

        // Setup table
        this.productTable = new UniTableConfig(false, true, 25)
            .setSearchable(true)
            .setColumns([partNameCol, nameCol, priceExVatCol, priceIncVatCol]);
    }
}
