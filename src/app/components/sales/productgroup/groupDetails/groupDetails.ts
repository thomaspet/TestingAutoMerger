import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FieldType, UniFieldLayout} from '@uni-framework/ui/uniform/index';
import {ProductCategory} from '@uni-entities';
import {ProductCategoryService, ErrorService, StatisticsService} from '@app/services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {IUniSearchConfig} from '@uni-framework/ui/unisearch';
import {UniSearchProductConfig} from '@app/services/common/uniSearchConfig/uniSearchProductConfig';

import {Observable, BehaviorSubject} from 'rxjs';
import * as _ from 'lodash';

class ExtendedProductCategory extends ProductCategory {
    _isDirty: boolean;
}

@Component({
    selector: 'group-details',
    templateUrl: './groupDetails.html'
})
export class GroupDetails implements OnInit {
    @Input() group: ExtendedProductCategory;
    @Output() groupChange: EventEmitter<ProductCategory> = new EventEmitter(false);
    @Output() changes: EventEmitter<any> = new EventEmitter(false);

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<ExtendedProductCategory> = new BehaviorSubject(new ExtendedProductCategory());

    public tableConfig: UniTableConfig;
    public products$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public uniSearchConfig: IUniSearchConfig;

    productsInCategory: any[] = [];

    constructor(
        private productCategoryService: ProductCategoryService,
        private errorService: ErrorService,
        private statisticsService: StatisticsService,
        private uniSearchProductConfig: UniSearchProductConfig,
    ) {
        this.uniSearchConfig = this.uniSearchProductConfig.generateProductsConfig();
    }

    public ngOnInit() {
        this.fields$.next(this.getFormFields());
        this.tableConfig = this.getTableConfig();
    }

    public ngOnChanges() {
        if (this.group) {
            this.model$.next(this.group);
            this.getProductsInGroup(this.group);
        }
    }

    public onFormChange(changes: any) {
        this.group = this.model$.getValue();
        this.group['_isDirty'] = true;
        this.groupChange.emit(this.group);
        this.changes.emit();
    }

    public getProductsInGroup(group) {
        if (!group.ID) {
            this.productsInCategory = [];
            return;
        }

        Observable.forkJoin(
            this.productCategoryService.getCategoryLinks(group.ID),
            this.statisticsService.GetAllUnwrapped(
                `model=Product&select=ID,PartName,Name,CostPrice,PriceExVat,`
                + `Unit&join=Product.ID eq ProductCategoryLink.ProductID&filter=`
                + `ProductCategoryLink.ProductCategoryID eq ${group.ID}`
            )
        ).subscribe(
            res => {
                const categoryLinks = res[0];
                const productsInCategory = res[1];

                this.productsInCategory = productsInCategory.map(product => {
                    const categoryLink = categoryLinks.find(link => link.ProductID === product.ProductID);
                    product['_categoryLinkID'] = categoryLink && categoryLink.ID;
                    return product;
                });
            },
            err => this.errorService.handle(err)
        );
    }

    onRowDeleted(rowModel) {
        this.productCategoryService.deleteCategoryLink(rowModel['_categoryLinkID']).subscribe(
            () => { this.getProductsInGroup(this.group); },
            (err) => this.errorService.handle(err)
        );
    }

    public onProductAdded(event: any) {
        if (event.ID && this.group) {

            this.productCategoryService.saveCategoryTag(event.ID, this.group).subscribe(res => {
                this.getProductsInGroup(this.group);
                this.fields$.next(this.getFormFields());
            });
        }
    }

    private getFormFields(): Partial<UniFieldLayout>[] {
        return [
            {
                FieldType: FieldType.TEXT,
                Label: 'Gruppenavn',
                Property: 'Name',
                Placeholder: 'Navn på produktgruppen'
            },
            {
                FieldType: FieldType.TEXTAREA,
                Label: 'Beskrivelse',
                Property: 'Description',
                Placeholder: 'Beskrivelse av produktgruppe'
            }
        ];
    }

    private getTableConfig(): UniTableConfig {
        const numberCol = new UniTableColumn('ProductPartName', 'Produktnr', UniTableColumnType.Text);
        const nameCol = new UniTableColumn('ProductName', 'Navn', UniTableColumnType.Text);
        const unitCol = new UniTableColumn('ProductUnit', 'Enhet', UniTableColumnType.Text).setWidth('4rem');
        const costpriceCol = new UniTableColumn('ProductCostPrice', 'Innpris eks.mva', UniTableColumnType.Money);
        const priceexvatCol = new UniTableColumn('ProductPriceExVat', 'Utpris eks.mva', UniTableColumnType.Money);

        const tableName = 'sales.productgroups.products';
        return new UniTableConfig(tableName, false, true, 15)
            .setColumns([numberCol, nameCol, unitCol, costpriceCol, priceexvatCol])
            .setAutoAddNewRow(false)
            .setDeleteButton(true)
            .setSearchable(false);
    }
}
