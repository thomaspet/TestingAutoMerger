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

    products: ElsaProduct[];

    constructor(
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
    ) {}

    ngOnChanges() {
        if (this.data) {
            this.initData();
        }
    }

    initData() {
        this.elsaProductService.GetAll().subscribe(
            products => {
                products = products.filter(product => {
                    return product.ProductType === ElsaProductType.Module
                        && product.IsPerUser
                        && product.Name !== 'Complete';
                });

                if (this.data.products && this.data.products.length) {
                    products.forEach(product => {
                        if (this.data.products.some(p => p.ID === product.ID)) {
                            product['_selected'] = true;
                        }
                    });
                }

                this.products = products;
            },
            err => this.errorService.handle(err),
        );
    }

    onSelectionChange() {
        this.data.products = this.products.filter(u => !!u['_selected']);
        this.stepComplete.emit(this.data.products.length > 0);
    }
}
