import {Component, EventEmitter, OnInit} from '@angular/core';
import {
    IModalOptions,
    IUniModal,
    UniModalService,
    ManageProductsModal,
    ConfirmActions,
    UniActivateInvoicePrintModal,
    UniActivateAPModal,
    ActivateOCRModal
} from '@uni-framework/uni-modal';
import {ElsaProduct, ElsaProductType} from '@app/services/elsa/elsaModels';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {AuthService} from '@app/authService';

import {CompanySettingsService, EHFService} from '@app/services/services';

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
    cannotPurchaseProductsText: string;
    extensionBoughtAndActivated: boolean;
    elsaProductType = ElsaProductType;

    action: {
        label: string,
        click: () => void
    };

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private elsaProductService: ElsaProductService,
        private companySettingsService: CompanySettingsService,
        private ehfService: EHFService,
    ) {
        this.authService.authentication$.take(1).subscribe(auth => {
            try {
                this.canPurchaseProducts = auth.user.License.CustomerAgreement.CanAgreeToLicense;
            } catch (e) {}
        });
    }

    ngOnInit() {
        this.product = this.options.data;

        if (this.product.productType !== ElsaProductType.Integration) {
            if (!this.canPurchaseProducts) {
                this.cannotPurchaseProductsText = 'Du har ikke rettigheter til å aktivere produkter.';
            }

            // This is messy as f$2#!, but we need to solve activation NOW..
            // Will come back to it when prod marketplace actually works
            if (this.product.isPerUser) {
                this.action = {
                    label: 'Velg brukere',
                    click: () => this.manageUserPurchases()
                };
            } else {
                if (this.product['_isBought']) {
                    this.setActivationAction();
                    if (!this.action) {
                        this.extensionBoughtAndActivated = true;
                    }
                } else {
                    this.action = {
                        label: 'Kjøp produkt',
                        click: () => this.purchaseProduct(this.product)
                    };
                }
            }
        }
    }

    // This is messy as f$2#!, but we need to solve activation NOW..
    // Will come back to it when prod marketplace actually works
    private setActivationAction() {
        this.companySettingsService.Get(1).subscribe(settings => {
            const name = this.product && this.product.name.toLowerCase();

            let activationModal;

            if (name === 'invoiceprint' && !this.ehfService.isActivated('EHF INVOICE 2.0')) {
                activationModal = UniActivateInvoicePrintModal;

            } else if (name === 'ehf' && !this.ehfService.isActivated('NETSPRINT')) {
                activationModal = UniActivateAPModal;

            } else if (name === 'ocr-scan' && !settings.UseOcrInterpretation) {
                activationModal = ActivateOCRModal;
            }

            if (activationModal) {
                this.action = {
                    label: 'Aktiver',
                    click: () => {
                        this.modalService.open(activationModal).onClose.subscribe(res => {
                            if (res || res === ConfirmActions.ACCEPT) {
                                this.action = undefined;
                                this.onClose.emit();
                            }
                        });
                    }
                };
            } else {
                this.action = undefined;
            }
        });
    }


    manageUserPurchases() {
        if (this.canPurchaseProducts) {
            const companyKey = this.authService.getCompanyKey();
            this.modalService.open(ManageProductsModal, {
                closeOnClickOutside: true,
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
                () => {
                    this.product['_isBought'] = true;

                    // This is messy as f$2#!, but we need to solve activation NOW..
                    // Will come back to it when prod marketplace actually works
                    this.setActivationAction();
                    if (this.action) {
                        this.action.click();
                    }
                },
                err => console.error(err)
            );
        }
    }

    priceText(product: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(product);
    }
}
