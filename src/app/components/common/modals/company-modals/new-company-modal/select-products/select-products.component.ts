import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ElsaProduct} from '@app/models';

@Component({
    selector: 'uni-select-products',
    templateUrl: './select-products.component.html',
    styleUrls: ['./select-products.component.sass']
})
export class SelectProductsComponent {
    @Input() products: ElsaProduct[];
    @Input() selectedProductsNames: string[] = [];
    @Output() selectedProductsNamesChange = new EventEmitter<string[]>();

    onSelectionChange(product: ElsaProduct) {
        product['_selected'] = !product['_selected'];
        const selectedProductsNames = this.products
            .filter(p => p['_selected'])
            .map(p => p.Name);
        this.selectedProductsNamesChange.emit(selectedProductsNames);
    }
}
