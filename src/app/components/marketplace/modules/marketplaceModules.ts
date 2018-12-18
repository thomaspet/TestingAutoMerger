import {Component, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {forkJoin} from 'rxjs';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType} from '@app/models';
import {
    ElsaProductService,
    ElsaPurchaseService,
    ErrorService,
    CompanySettingsService,
    EHFService,
    PaymentBatchService,
} from '@app/services/services';
import {
    UniModalService,
    ActivateOCRModal,
    UniActivateAPModal,
    UniActivateInvoicePrintModal,
    ProductPurchasesModal,
    UniAutobankAgreementModal,
} from '@uni-framework/uni-modal';

import {CompanySettings} from '@uni-entities';
import {ActivationEnum, ElsaPurchase} from '@app/models';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    cannotPurchaseProductsText: string;
    canPurchaseProducts: boolean;

    modules: ElsaProduct[];
    extensions: ElsaProduct[];
    filteredExtensions: ElsaProduct[];
    tabs: IUniTab[];

    private companySettings: CompanySettings;
    private autobankAgreements: any[];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private ehfService: EHFService,
        private paymentBatchService: PaymentBatchService
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/modules', moduleID: UniModules.Marketplace, active: true
        });

        this.authService.authentication$.take(1).subscribe(auth => {
            try {
                this.canPurchaseProducts = auth.user.License.CustomerAgreement.CanAgreeToLicense;
                if (!this.canPurchaseProducts) {
                    this.cannotPurchaseProductsText = 'Du har ikke rettigheter til å aktivere produkter.';
                }
            } catch (e) {}
        });
    }

    ngAfterViewInit() {
        forkJoin(
            this.companySettingsService.Get(1),
            this.paymentBatchService.checkAutoBankAgreement(),
            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll(),
        ).subscribe(
            res => {
                this.companySettings = res[0];
                this.autobankAgreements = res[1] || [];

                const products = res[2] || [];
                this.modules = products.filter(p => p.productType === ElsaProductType.Module);
                this.extensions = products
                    .filter(p => p.productType === ElsaProductType.Extension)
                    .map(extension => {
                        this.setActivationFunction(extension);
                        return extension;
                    });

                this.setPurchaseInfo(res[3]);

                const tabs = this.modules.map(m => ({name: m.label, value: m.name}));
                tabs.unshift({ name: 'Alle', value: null });
                this.tabs = tabs;
                this.onTabChange(this.tabs[0]);

                // Check queryParams if we should open a specific product dialog immediately
                this.route.queryParamMap.subscribe(paramMap => {
                    const productName = paramMap.get('productName');
                    if (productName) {
                        const product = products.find(p => {
                            return productName.toLowerCase() === (p.name || '').toLowerCase();
                        });

                        if (product) {
                            this.openSubscribeModal(product);
                        }
                    }
                });
            },
            err => this.errorService.handle(err)
        );
    }

    setPurchaseInfo(purchases: ElsaPurchase[]) {
        this.modules = this.modules.map(product => {
            product['_isBought'] = purchases.some(p => p.ProductID === product.id);
            return product;
        });

        this.extensions = this.extensions.map(extension => {
            extension['_isBought'] = purchases.some(p => p.ProductID === extension.id);
            return extension;
        });
    }

    private setActivationFunction(product: ElsaProduct) {
        const name = product && product.name && product.name.toLowerCase();
        let activationModal;

        if (name === 'invoiceprint' && !this.ehfService.isInvoicePrintActivated(this.companySettings)) {
            activationModal = UniActivateInvoicePrintModal;
        } else if (name === 'ehf' && !this.ehfService.isEHFActivated(this.companySettings)) {
            activationModal = UniActivateAPModal;
        } else if (name === 'ocr-scan' && !this.companySettings.UseOcrInterpretation) {
            activationModal = ActivateOCRModal;
        } else if (name === 'autobank' && !this.autobankAgreements.length) {
            activationModal = UniAutobankAgreementModal;
        }

        if (activationModal) {
            product['_activationFunction'] = {
                label: 'Aktiver',
                click: () => {
                    this.modalService.open(activationModal, {}).onClose.subscribe(res => {
                        if (res && res !== ActivationEnum.NOT_ACTIVATED) {
                            product['_activationFunction'] = undefined;
                        }
                    });
                }
            };
        }
    }

    openSubscribeModal(module: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: module,
            closeOnClickOutside: true
        });
    }

    onTabChange(tab: IUniTab) {
        if (tab.value) {
            this.filteredExtensions = this.extensions.filter(extension => {
                return extension.parentProducts.some(pName => pName === tab.value);
            });
        } else {
            this.filteredExtensions = this.extensions;
        }
    }

    priceText(module: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(module);
    }

    manageUserPurchases(product: ElsaProduct) {
        this.modalService.open(ProductPurchasesModal, {
            data: {
                product: product
            }
        }).onClose.subscribe(changesMade => {
            if (changesMade) {
                this.elsaPurchaseService.getAll().subscribe(purchases => {
                    this.setPurchaseInfo(purchases);
                });
            }
        });
    }

    purchaseExtension(product: ElsaProduct) {
        if (this.canPurchaseProducts) {
            const purchase: ElsaPurchase = {
                ID: null,
                ProductID: product.id
            };

            this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                () => product['_isBought'] = true,
                err => this.errorService.handle(err)
            );
        }
    }
}
