import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {UniForm, FieldType, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {ProductCategory} from '../../../../unientities';
import {ProductCategoryService, ErrorService, StatisticsService} from '@app/services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from '@uni-framework/ui/unitable';
import {IUniSearchConfig} from '@uni-framework/ui/unisearch';
import {UniSearchProductConfig} from '@app/services/common/uniSearchConfig/uniSearchProductConfig';

import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as _ from 'lodash';

@Component({
    selector: 'group-details',
    templateUrl: './groupDetails.html'
})
export class GroupDetails implements OnInit {
    @Input() public group: ProductCategory;
    @Output() public groupChange: EventEmitter<ProductCategory> = new EventEmitter(false);

    @Output() public createChildGroup: EventEmitter<any> = new EventEmitter(false);
    @Output() public deleteGroup: EventEmitter<any> = new EventEmitter(false);

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public model$: BehaviorSubject<ProductCategory> = new BehaviorSubject(new ProductCategory());

    public tableConfig: UniTableConfig;
    public products$: BehaviorSubject<any[]> = new BehaviorSubject([]);

    public uniSearchConfig: IUniSearchConfig;

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
    }

    public getProductsInGroup(group) {
        if (!group.ID) {
            return;
        }

        this.statisticsService.GetAllUnwrapped(
            `model=Product&select=PartName,Name,CostPrice,PriceExVat,`
            + `Unit&join=Product.ID eq ProductCategoryLink.ProductID&filter=`
            + `ProductCategoryLink.ProductCategoryID eq ${group.ID}`
        ).subscribe(products => {
            this.products$.next(products);
        });
    }

    public onProductAdded(event: any) {
        if (event.ID && this.group) {
            this.productCategoryService.saveCategoryTag(event.ID, this.group).subscribe(res => {
                this.getProductsInGroup(this.group);
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
        return new UniTableConfig(tableName, false, false, 15)
            .setColumns([numberCol, nameCol, unitCol, costpriceCol, priceexvatCol])
            .setSearchable(false);
    }
}
