import {Component, ViewChild, OnInit} from '@angular/core';
import {UniForm, FieldType, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {ProductCategory} from '../../../../unientities';
import {
    ProductCategoryService,
    ErrorService,
    StatisticsService
} from '../../../../services/services';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {IUniSearchConfig} from '../../../../../framework/ui/unisearch/index';
import {UniSearchProductConfig} from '../../../../services/common/uniSearchConfig/uniSearchProductConfig';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
declare const _; // lodash

@Component({
    selector: 'group-details',
    templateUrl: './groupDetails.html'
})
export class GroupDetails implements OnInit {
    @ViewChild(UniForm)
    public form: UniForm;

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public group$: BehaviorSubject<ProductCategory> = new BehaviorSubject(new ProductCategory());

    public productsConfig: UniTableConfig;
    public products$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public uniSearchConfig: IUniSearchConfig;

    constructor(
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private uniSearchProductConfig: UniSearchProductConfig
    ) {
        this.uniSearchConfig = this.uniSearchProductConfig.generateProductsConfig();
    }

    public ngOnInit() {
        this.fields$.next(this.getComponentFields());

        this.productCategoryService.currentProductGroup.subscribe(
            (productGroup) => {
                if (productGroup) {
                    this.group$.next(productGroup);
                    this.setRelatedProducts(productGroup);
                } else {
                    this.products$.next([]);
                    this.group$.next(new ProductCategory);
                    this.productCategoryService.currentProductGroup.next(this.group$.value);
                }
            });

        this.setupTable();
    }

    public change(changes: any) {
        this.productCategoryService.currentProductGroup.next(this.group$.value);
        this.productCategoryService.isDirty = true;
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

    public selectItem(event: any) {
        let productGroup = this.productCategoryService.currentProductGroup.value;

        if (event.ID && productGroup) {
            return this.productCategoryService.saveCategoryTag(event.ID, productGroup)
            .subscribe(res => {
                this.productCategoryService.currentProductGroup.subscribe(group => this.setRelatedProducts(group));
            });
        }
        return;
    }

    private getComponentFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Gruppenavn',
                Property: 'Name',
                Placeholder: 'Navn på produktgruppen'
            },
            <any>{
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Placeholder: 'Beskrivelse av produktgruppe'
            }
        ];
    }

    private setupTable() {
        let numberCol = new UniTableColumn('ProductPartName', 'Produktnr', UniTableColumnType.Text);
        let nameCol = new UniTableColumn('ProductName', 'Navn', UniTableColumnType.Text);
        let unitCol = new UniTableColumn('ProductUnit', 'Enhet', UniTableColumnType.Text).setWidth('4rem');
        let costpriceCol = new UniTableColumn('ProductCostPrice', 'Innpris eks.mva', UniTableColumnType.Money);
        let priceexvatCol = new UniTableColumn('ProductPriceExVat', 'Utpris eks.mva', UniTableColumnType.Money);

        let tableName = 'sales.productgroups.products';
        this.productsConfig = new UniTableConfig(tableName, false, false, 15)
            .setColumns([numberCol, nameCol, unitCol, costpriceCol, priceexvatCol])
            .setSearchable(true);
    }
}
