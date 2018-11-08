import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal, UniModalService, ManageProductsModal} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaProductType} from '@app/services/elsa/elsaModels';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {AuthService} from '@app/authService';

@Component({
    selector: 'uni-product-subscribe-modal',
    templateUrl: './subscribe-modal.html',
    styleUrls: ['./subscribe-modal.sass']
})
export class SubscribeModal implements IUniModal, OnInit {
    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    product: ElsaProduct;
    canPurchaseProducts: boolean;
    cannotPurchaseProductsText: string;
    elsaProductType = ElsaProductType;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
    ) {
        this.authService.authentication$.take(1).subscribe(auth => {
            try {
                this.canPurchaseProducts = auth.user.License.CustomerAgreement.CanAgreeToLicense;
            } catch (e) {}
        });
    }

    ngOnInit() {
        this.product = this.options.data;
        if (!this.canPurchaseProducts) {
            const action = this.product['_isBought'] ? 'velge brukere' : 'aktivere produkter';
            this.cannotPurchaseProductsText = 'Du har ikke rettigheter til å ' + action + '. Vennligst kontakt systemansvarlig.';
        }
    }

    manageUserPurchases() {
        if (this.canPurchaseProducts) {
            const companyKey = this.authService.getCompanyKey();
            this.modalService.open(ManageProductsModal, {
                header: `Velg hvilke brukere som skal ha hvilke produkter`,
                data: {
                    companyKey: companyKey,
                    selectedProduct: this.product
                },
            });

            this.onClose.emit();
        }
    }

    purchaseProduct(product) {
        if (this.canPurchaseProducts) {
            this.elsaProductService.PurchaseProductOnCurrentCompany(product).subscribe(
                res => {
                    this.product['_isBought'] = true;
                },
                err => console.error(err)
            );
        }
    }

    togglePerTransactionProduct() {
        window.alert('Not yet implemented');
    }

    close() {
        this.onClose.emit();
    }

    priceText(product: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(product);
    }
}
