import {Component, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {Observable} from 'rxjs';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType, ElsaPurchasesForUserLicenseByCompany, ElsaPurchase} from '@app/services/elsa/elsaModels';
import {
    ElsaProductService,
    ElsaCompanyLicenseService,
    ElsaPurchaseService,
    ErrorService,
    CompanySettingsService,
    EHFService
} from '@app/services/services';
import {
    UniModalService,
    ActivateOCRModal,
    UniActivateAPModal,
    UniActivateInvoicePrintModal,
    ManageProductsModal,
    IModalOptions,
} from '@uni-framework/uni-modal';

import {CompanySettings} from '@uni-entities';
import {ActivationEnum} from '@app/models/activationEnum';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    cannotPurchaseProductsText: string;
    canPurchaseProducts: boolean;
    private companyKey: string;
    modules: ElsaProduct[];
    extensions: ElsaProduct[];
    filteredExtensions: ElsaProduct[];
    tabs: IUniTab[];

    private companySettings: CompanySettings;

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private ehfService: EHFService,
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
        this.companyKey = this.authService.getCompanyKey();

        // Get products first, then settings and purchases with error handler
        // that returns empty purchases array if the request fails (missing permissions).
        // This is done because we want everyone to see the marketplace
        // with available products, even though they can't make purchases.
        this.elsaProductService.GetAll().subscribe(
            products => {
                Observable.forkJoin(
                    this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey),
                    this.elsaPurchaseService.GetAllByCompanyKey(this.companyKey),
                    this.companySettingsService.Get(1),
                ).catch(() => {
                    return Observable.of([]);
                }).subscribe((res) => {
                    const userPurchases = res[0] || [];
                    const companyPurchases = res[1] || [];
                    this.companySettings = res[2];

                    const modules = products.filter(p => p.productType === ElsaProductType.Module);
                    this.modules = modules.map(product => {
                        product['_isBought'] = userPurchases.some(p => p.productID === product.id && p.isAssigned);
                        this.setActivationFunction(product);
                        return product;
                    });

                    const extensions = products.filter(p => p.productType === ElsaProductType.Extension);
                    this.extensions = extensions.map(product => {
                        product['_isBought'] = companyPurchases.some(p => p.productID === product.id);
                        if (this.companySettings) {
                            this.setActivationFunction(product);
                        }
                        return product;
                    });

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
                });
            },
            err => this.errorService.handle(err)
        );
    }

    private setActivationFunction(product: ElsaProduct) {
        const name = product && product.name.toLowerCase();
        let activationModal;
        let label: string;
        let options: IModalOptions = {};



        switch (product.productType) {
            case ElsaProductType.Module:
                label = 'Velg brukere';
                options = {
                    closeOnClickOutside: true,
                    data: {
                        companyKey: this.companyKey,
                        selectedProduct: product
                    }
                };
                activationModal = ManageProductsModal;
                break;
            case ElsaProductType.Extension:
                label = 'Aktiver';
                if (name === 'invoiceprint' && !this.ehfService.isInvoicePrintActivated(this.companySettings)) {
                    activationModal = UniActivateInvoicePrintModal;
                } else if (name === 'ehf' && !this.ehfService.isEHFActivated(this.companySettings)) {
                    activationModal = UniActivateAPModal;
                } else if (name === 'ocr-scan' && !this.companySettings.UseOcrInterpretation) {
                    activationModal = ActivateOCRModal;
                }
        }

        if (activationModal) {
            product['_activationFunction'] = {
                label: label,
                click: () => {
                    this.modalService.open(activationModal, options).onClose.subscribe(res => {
                        if (res && res !== ActivationEnum.NOT_ACTIVATED) {
                            product['_activationFunction'] = undefined;
                        }
                        if (product.productType === ElsaProductType.Module) {
                            this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey)
                                .catch(() => {
                                    return Observable.of([]);
                                })
                                .subscribe((purchases: ElsaPurchasesForUserLicenseByCompany[]) => {
                                    product['_isBought'] = purchases.some(p => p.productID === product.id && p.isAssigned);
                            });
                        } else if (product.productType === ElsaProductType.Extension) {
                            this.elsaPurchaseService.GetAllByCompanyKey(this.companyKey)
                                .catch(() => {
                                    return Observable.of([]);
                                })
                                .subscribe((purchases: ElsaPurchase[]) => {
                                    product['_isBought'] = purchases.some(p => p.productID === product.id);
                                });
                        }
                    });
                }
            };
        } else if (!product['_isBought']) {
            product['_activationFunction'] = {
                label: 'Kjøp produkt',
                click: () => this.purchaseProduct(product)
            };
        } else {
            delete product['_activationFunction'];
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

    purchaseProduct(product) {
        if (this.canPurchaseProducts) {
            this.elsaProductService.PurchaseProductOnCurrentCompany(product).subscribe(
                () => {
                    product['_isBought'] = true;
                },
                err => console.error(err)
            );
        }
    }
}
