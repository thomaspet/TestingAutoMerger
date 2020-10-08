import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from './grant-access-modal';
import {ElsaProduct, ElsaProductType} from '@app/models';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ErrorService} from '@app/services/common/errorService';

@Component({
    selector: 'select-products-for-bulk-access',
    templateUrl: './4.selectProducts.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectProductsForBulkAccess {
    @Input() data: GrantAccessData;
    @Output() stepComplete: EventEmitter<boolean> = new EventEmitter();

    busy = false;

    constructor(
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges() {
        if (this.data && !this.data.StoredData?.products) {
            this.initData();
        }
    }

    initData() {
        this.busy = true;
        this.elsaProductService.invalidateCache();
        this.elsaProductService.getProductsOnContractTypes(this.data.contract.ContractType).subscribe(
            products => {
                products = products.filter(product => {
                    return (product.ProductType === ElsaProductType.Module
                        || product.ProductType === ElsaProductType.Package)
                        && product.IsPerUser;
                });

                products.forEach(product => {
                    product['_selected'] = product.IsDefaultProduct || product.IsMandatoryProduct;
                    product['_isMandatory'] = product.IsMandatoryProduct;
                });

                if (this.data.products && this.data.products.length) {
                    products.forEach(product => {
                        if (this.data.products.some(p => p.ID === product.ID)) {
                            product['_selected'] = true;
                        }
                    });
                }
                this.busy = false;
                this.data.StoredData.products = products;

                this.onSelectionChange();
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    onSelectionChange() {
        this.data.products = this.data.StoredData.products.filter(product => !!product['_selected']);
        this.stepComplete.emit(this.data.products.length > 0);
    }
}
