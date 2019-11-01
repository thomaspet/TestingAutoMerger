import { OnInit, Component, Output, EventEmitter, Input } from "@angular/core";
import { IUniModal, IModalOptions } from "@uni-framework/uni-modal";
import { Product } from "@uni-entities";
import { UniTableConfig } from '@uni-framework/ui/unitable/config/unitableConfig';
import { UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable/config/unitableColumn';
import { IUniSearchConfig } from "@uni-framework/ui/unisearch";
import { UniSearchProductConfig, ProductService } from "@app/services/services";
import { RequestMethod } from "@uni-framework/core/http";

declare var _;

@Component({
    selector: 'uni-barnepassproducts-modal',
    templateUrl: './barnepassProductsModal.html',
    styleUrls: ['./barnepassview.sass']
})
export class BarnepassProductsModal implements OnInit, IUniModal {

    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public products: Product[];
    public tableConfig: UniTableConfig;
    public searchConfig: IUniSearchConfig;

    constructor(
        private uniSearchProductConfig: UniSearchProductConfig,
        private productService: ProductService
    )
    {
        this.searchConfig = this.uniSearchProductConfig.generateProductsConfig();
    }

    ngOnInit(): void {
        this.products = this.options.data.model;

        this.setTableConfig();
    }

    setTableConfig() {
        const productNumberCol = new UniTableColumn('PartName', 'Produktnr', UniTableColumnType.Text);
        const productNameCol = new UniTableColumn('Name', 'Produktnavn', UniTableColumnType.Text);
        const productColumns = [productNumberCol, productNameCol];
        this.tableConfig = new UniTableConfig('products.barnepassModal', false) 
            .setEntityType('Product')
            .setColumns(productColumns)
            .setDeleteButton(true)
            ; 
    }

    public productSelected(event: Product) {
        if (!this.products.find(x => x.ID == event.ID)) {
            this.products.push(event);
            this.products = _.cloneDeep(this.products);
        }
    }

    public onRowDelete(row: Product) {
        const index = row['_originalIndex'];
        if (index > -1 ) {
            this.products.splice(index, 1);
            this.products = _.cloneDeep(this.products);
        }
    }

    public save() {
        const productIDs = [];
        this.products.forEach((product) => {
            productIDs.push(product.ID);
        })
        this.productService.ActionWithBody(null, productIDs, 'save-barnepass-products', RequestMethod.Put).subscribe(() => {
            this.onClose.emit(this.products);
        });        
    }    
    
    public close() {
        this.onClose.emit();
    }    
}