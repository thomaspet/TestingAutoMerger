import { Component, OnInit, Directive, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { ElsaProductService } from '@app/services/services';
import { ElsaProduct, ElsaProductType } from '@app/models';

@Component({
    selector: 'uni-select-products',
    templateUrl: './select-products.component.html',
    styleUrls: ['./select-products.component.sass']
})
export class SelectProductsComponent implements OnInit {
    @Input() selectedProductsNames: string[] = [];
    @Output() selectedProductsNamesChange = new EventEmitter<string[]>();

    products: ElsaProduct[] = [];

    constructor(private elsaProductService: ElsaProductService) { }

    ngOnInit() {
        this.elsaProductService.GetAll()
        .subscribe(products => {
            products.map(product => {
                product['_selected'] = !!this.selectedProductsNames.find(name => name === product.Name);
                return product;
            });
            this.products = products.filter(product => product.ProductType === ElsaProductType.Module);
        });
    }

    onSelectionChange(product: ElsaProduct) {
        product['_selected'] = !product['_selected'];
        const selectedProductsNames = this.products
            .filter(p => p['_selected'])
            .map(p => p.Name);
        this.selectedProductsNamesChange.emit(selectedProductsNames);
    }
}

@Directive({
    selector: '[matBadgeIcon]'
})
export class MatBadgeIconDirective {

    @Input() matBadgeIcon: string;

    constructor(private el: ElementRef) {}

    ngOnInit() {
        const badge = this.el.nativeElement.querySelector('.mat-badge-content');
        badge.innerHTML = `<i class="material-icons" style="font-size: 20px; background-color: #3f76db">${this.matBadgeIcon}</i>`;
    }
}
