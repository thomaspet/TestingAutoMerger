import {Component, EventEmitter, OnInit} from '@angular/core';
import {
    IModalOptions,
    IUniModal,
    UniModalService,
    ProductPurchasesModal,
} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaProductType} from '@app/models';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaPurchaseService, ErrorService} from '@app/services/services';
import {ElsaPurchase} from '@app/models';

@Component({
    selector: 'uni-product-subscribe-modal',
    templateUrl: './subscribe-modal.html',
    styleUrls: ['./subscribe-modal.sass']
})
export class SubscribeModal implements IUniModal, OnInit {
    options: IModalOptions = {};
    onClose: EventEmitter<void> = new EventEmitter<void>();

    product: ElsaProduct;
    canPurchaseProducts: boolean;
    missingPermissionText: string;

    extensionBoughtAndActivated: boolean;
    elsaProductType = ElsaProductType;

    action: {
        label: string,
        click: () => void
    };

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.product = data.product;
        this.canPurchaseProducts = data.canPurchaseProducts;

        if (this.product.productType !== ElsaProductType.Integration) {
            if (!data.canPurchaseProducts) {
                this.missingPermissionText = 'Du må være administrator for å kjøpe produkter';
            }

            if (this.product.isPerUser) {
                this.action = {
                    label: 'Velg brukere',
                    click: () => this.manageUserPurchases()
                };
            } else {
                if (this.product['_isBought']) {
                    this.action = this.product['_activationFunction'];
                    if (!this.action) {
                        this.extensionBoughtAndActivated = true;
                    }
                } else {
                    this.action = {
                        label: 'Kjøp produkt',
                        click: () => this.purchaseProduct()
                    };
                }
            }
        }
    }

    manageUserPurchases() {
        if (this.canPurchaseProducts) {
            this.modalService.open(ProductPurchasesModal, {
                closeOnClickOutside: true,
                data: {
                    product: this.product
                },
            });

            this.onClose.emit();
        }
    }

    purchaseProduct() {
        if (this.canPurchaseProducts) {
            const purchase: ElsaPurchase = {
                ID: null,
                ProductID: this.product.id
            };

            this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                () => {
                    this.product['_isBought'] = true;
                    this.action = this.product['_activationFunction'];
                    if (this.action) {
                        this.action.click();
                    }
                },
                err => this.errorService.handle(err)
            );
        }
    }

    priceText(product: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(product);
    }
}
