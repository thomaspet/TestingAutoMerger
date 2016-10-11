import {Component} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {ProductService} from '../../../../services/services';
import {Product} from '../../../../unientities';
import {TabService, UniModules} from "../../../layout/navbar/tabstrip/tabService";

declare var jQuery;

@Component({
    selector: 'product-list',
    templateUrl: 'app/components/common/product/list/productList.html'
})
export class ProductList {
    private productTable: UniTableConfig;
    private lookupFunction: (urlParams: URLSearchParams) => any;

    constructor(private uniHttpService: UniHttp, private router: Router, private productService: ProductService, private tabService: TabService) {
        this.setupProductTable();
        this.tabService.addTab({ name: "Produkter", url: "/products", active: true, moduleID: UniModules.Products });
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

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');
                        
            return this.productService.GetAllByUrlSearchParams(params);
        };

        // Define columns to use in the table
        let partNameCol = new UniTableColumn('PartName', 'Produktnr',  UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains');
        let nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text).setFilterOperator('contains');
        let priceExVatCol = new UniTableColumn('PriceExVat', 'Utpris eks. mva',  UniTableColumnType.Number).setFilterOperator('eq')
                            .setWidth('15%')
                            .setFormat('{0:n}')
                            .setCls('column-align-right');
        let priceIncVatCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva',  UniTableColumnType.Number).setFilterOperator('eq')
                            .setWidth('15%')
                            .setFormat('{0:n}')
                            .setCls('column-align-right');

        let departmentCol = new UniTableColumn('Dimensions.DepartmentNumber', 'Avdeling', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Product) => {return data.Dimensions && data.Dimensions.Department ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name : ''; });
        let projectCol = new UniTableColumn('Dimensions.ProjectNumber', 'Prosjekt', UniTableColumnType.Text).setWidth('15%').setFilterOperator('contains')
            .setTemplate((data: Product) => {return data.Dimensions && data.Dimensions.Project ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name : ''; });
                                                    
        // Setup table
        this.productTable = new UniTableConfig(false, true, 25)            
            .setSearchable(true)            
            .setColumns([partNameCol, nameCol, priceExVatCol, priceIncVatCol, departmentCol, projectCol]);
    }
}
