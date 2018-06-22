import {Component, Output, EventEmitter, Input} from '@angular/core';
import {GrantAccessData} from '@app/components/bureau/grant-access-modal/grant-access-modal';
import {ElsaProduct} from '@app/services/elsa/elsaModels';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ErrorService} from '@app/services/common/errorService';

@Component({
    selector: 'select-products-for-bulk-access',
    templateUrl: './4.selectProducts.html',
    styleUrls: ['./grant-access-modal.sass']
})
export class SelectProductsForBulkAccess {
    @Output()
    public next: EventEmitter<void> = new EventEmitter<void>();
    @Input()
    data: GrantAccessData;

    products: ElsaProduct[];
    warning: string;

    constructor(
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.elsaProductService.GetAll()
            .do(products => this.reSelectProducts(products))
            .subscribe(
                products => this.products = products,
                err => this.errorService.handle(err),
            );
    }

    isAllSelected() {
        return this.products && this.products.every(c => !!c['_selected'])
    }

    toggleEverything(target: HTMLInputElement) {
        this.products.forEach(p => p['_selected'] = target.checked);
    }

    done() {
        const selectedUsers = this.products.filter(u => !!u['_selected']);
        if (selectedUsers.length === 0) {
            this.warning = 'Du må velge minst et produkt!';
            return;
        }
        this.data.products = selectedUsers;
        this.next.emit();
    }

    private reSelectProducts(newProduct: ElsaProduct[]): ElsaProduct[] {
        if (this.data.products) {
            newProduct.forEach(newProduct => {
                if (this.data.products.some(selectedProduct => selectedProduct.id === newProduct.id)) {
                    newProduct['_selected'] = true;
                }
            });
        }
        return newProduct;
    }
}
