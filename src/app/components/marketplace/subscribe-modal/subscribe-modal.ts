import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
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
    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    product: ElsaProduct;
    canPurchaseProducts: boolean;
    cannotPurchaseProductsText: string;
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
        // public extensionHelper: ExtensionsHelper
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
            // const action = this.product['_isBought'] ? 'velge brukere' : 'aktivere produkter';
            this.cannotPurchaseProductsText = 'Du har ikke rettigheter til å aktivere produkter';
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
            } else {
                this.action = {
                    label: 'Kjøp produkt',
                    click: () => this.purchaseProduct(this.product)
                };
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
                                this.close();
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
