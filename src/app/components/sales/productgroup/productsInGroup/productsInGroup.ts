import {Component, OnInit} from '@angular/core';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../../services/services';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _; // lodash

@Component({
    selector: 'products-in-group',
    templateUrl: './productsInGroup.html'
})
export class ProductsInGroup implements OnInit {
    public productsConfig: UniTableConfig;
    public products$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private productCategoryService: ProductCategoryService
    ) {}

    public ngOnInit() {
        this.setupTable();

        if (
            this.productCategoryService.currentProductGroup.value !== null
            && this.productCategoryService.currentProductGroup.value !== undefined
        ) {
            this.productCategoryService.currentProductGroup.subscribe(group => this.setRelatedProducts(group));
        }
    }

   public setRelatedProducts(group) {
       if (!group.ID) {
           return;
       }
       this.statisticsService.GetAllUnwrapped(`model=Product&select=PartName,Name,CostPrice,PriceExVat,`
           + `Unit&join=Product.ID eq ProductCategoryLink.ProductID&filter=`
           + `ProductCategoryLink.ProductCategoryID eq ${group.ID}`)
           .subscribe(products => {
               this.products$.next(products);
           });
   }

    private setupTable() {
        let numberCol = new UniTableColumn('ProductPartName', 'Produktnr', UniTableColumnType.Text);
        let nameCol = new UniTableColumn('ProductName', 'Navn', UniTableColumnType.Text);
        let unitCol = new UniTableColumn('ProductUnit', 'Enhet', UniTableColumnType.Text).setWidth('4rem');
        let costpriceCol = new UniTableColumn('ProductCostPrice', 'Innpris eks.mva', UniTableColumnType.Money);
        let priceexvatCol = new UniTableColumn('ProductPriceExVat', 'Utpris eks.mva', UniTableColumnType.Money);

        let tableName = 'sales.productgroups.products';
        this.productsConfig = new UniTableConfig(tableName, false, false, 25)
            .setColumns([numberCol, nameCol, unitCol, costpriceCol, priceexvatCol])
            .setSearchable(true);
    }
}
