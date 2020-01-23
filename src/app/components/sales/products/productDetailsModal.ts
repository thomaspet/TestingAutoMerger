import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ProductDetails} from './productDetails';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';

@Component({
    selector: 'uni-product-details-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw">
            <header>Produkt</header>

            <article [attr.aria-busy]="busy">
                <product-details [modalMode]="true" (productSavedInModalMode)="close($event)"></product-details>
            </article>

            <footer>
                <button (click)="save()" class="good">Lagre</button>
                <button (click)="close(null)" class="bad">Avbryt</button>
            </footer>
        </section>
    `
})

export class UniProductDetailsModal implements IUniModal {

    @ViewChild(ProductDetails, { static: true })
    private productDetails: ProductDetails;

    @Input()
    public options: IModalOptions;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public busy: boolean = false;

    constructor() {}

    public save() {
        this.busy = true;
        this.productDetails.saveProduct(() => {});
    }

    public close(product) {
        this.busy = false;
        this.onClose.emit(product);
    }

}
