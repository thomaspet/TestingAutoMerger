import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {URLSearchParams} from '@angular/http';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {ProductService, ErrorService} from '../../../services/services';
import {Product} from '../../../unientities';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'product-list',
    templateUrl: './productList.html'
})
export class ProductList {
    public productTable: UniTableConfig;
    public lookupFunction: (urlParams: URLSearchParams) => any;
    public saveActions: IUniSaveAction[];

    constructor(
        private router: Router,
        private productService: ProductService,
        private tabService: TabService,
        private errorService: ErrorService
    ) {
        this.tabService.addTab({
            name: 'Produkter',
            url: '/sales/products',
            active: true,
            moduleID: UniModules.Products
        });

        this.saveActions = [{
            label: 'Nytt produkt',
            main: true,
            action: (done) => {
                done();
                this.router.navigateByUrl('/sales/products/0');
            }
        }];

        this.setupProductTable();
    }

    public onRowSelected (event) {
        this.router.navigateByUrl('/sales/products/' + event.rowModel.ID);
    };

    private setupProductTable() {

        this.lookupFunction = (urlParams: URLSearchParams) => {
            let params = urlParams;

            if (params === null) {
                params = new URLSearchParams();
            }

            params.set('expand', 'Info,Dimensions,Dimensions.Department,Dimensions.Project');

            return this.productService.GetAllByUrlSearchParams(params)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        };

        let partNameCol = new UniTableColumn('PartName', 'Produktnr',  UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains');

        let nameCol = new UniTableColumn('Name', 'Navn',  UniTableColumnType.Text)
            .setFilterOperator('contains');

        let priceExVatCol = new UniTableColumn('PriceExVat', 'Utpris eks. mva',  UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('15%')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        let priceIncVatCol = new UniTableColumn('PriceIncVat', 'Utpris inkl. mva',  UniTableColumnType.Money)
            .setFilterOperator('eq')
            .setWidth('15%')
            .setIsSumColumn(true)
            .setCls('column-align-right');

        let departmentCol = new UniTableColumn(
            'Dimensions.Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text
        )
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Department
                    ? data.Dimensions.Department.DepartmentNumber + ': ' + data.Dimensions.Department.Name
                    : '';
            });

        let projectCol = new UniTableColumn('Dimensions.Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setWidth('15%')
            .setFilterOperator('contains')
            .setTemplate((data: Product) => {
                return data.Dimensions && data.Dimensions.Project
                    ? data.Dimensions.Project.ProjectNumber + ': ' + data.Dimensions.Project.Name
                    : '';
            });

        this.productTable = new UniTableConfig('common.productList', false, true, 25)
            .setSearchable(true)
            .setEntityType('Product')
            .setSearchListVisible(true)
            .setColumns([
                partNameCol,
                nameCol,
                priceExVatCol,
                priceIncVatCol,
                departmentCol,
                projectCol
            ]);
    }
}
