import {Component, AfterViewInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, forkJoin} from 'rxjs';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType} from '@app/models';
import {
    ElsaProductService,
    ElsaPurchaseService,
    ErrorService,
    CompanySettingsService,
    EHFService,
    PaymentBatchService,
    UserRoleService,
} from '@app/services/services';
import {
    UniModalService,
    ActivateOCRModal,
    UniActivateAPModal,
    UniActivateEInvoiceModal,
    UniActivateInvoicePrintModal,
    ProductPurchasesModal,
    UniAutobankAgreementModal,
    MissingPurchasePermissionModal
} from '@uni-framework/uni-modal';

import {environment} from 'src/environments/environment';

import {CompanySettings} from '@uni-entities';
import {ActivationEnum, ElsaPurchase} from '@app/models';
import {IUniTab} from '@app/components/layout/uni-tabs';
import {ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    modules: ElsaProduct[];
    extensions: ElsaProduct[];
    filteredExtensions: ElsaProduct[];
    tabs: IUniTab[];
    isSrEnvironment = environment.isSrEnvironment;

    private canPurchaseProducts: boolean;
    private companySettings: CompanySettings;
    private autobankAgreements: any[];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private userRoleService: UserRoleService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private ehfService: EHFService,
        private paymentBatchService: PaymentBatchService,
        private toastService: ToastService
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/modules', moduleID: UniModules.Marketplace, active: true
        });
    }

    ngAfterViewInit() {
        const userID = this.authService.currentUser.ID;

        forkJoin(
            this.companySettingsService.Get(1),
            this.paymentBatchService.checkAutoBankAgreement()
                .catch(() => Observable.of([])), // fail silently

            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll(),
            this.userRoleService.hasAdminRole(userID),
        ).subscribe(
            res => {
                this.companySettings = res[0];
                this.autobankAgreements = res[1] || [];

                const products = res[2] || [];
                this.modules = products.filter(p => p.ProductType === ElsaProductType.Module);
                this.extensions = products
                    .filter(p => p.ProductType === ElsaProductType.Extension)
                    .map(extension => {
                        this.setActivationFunction(extension);
                        return extension;
                    });

                this.setPurchaseInfo(res[3]);
                this.canPurchaseProducts = res[4];

                const tabs = this.modules.map(m => ({name: m.Label, value: m.Name}));
                tabs.unshift({ name: 'Alle', value: null });
                this.tabs = tabs;
                this.onTabChange(this.tabs[0]);

                // Check queryParams if we should open a specific product dialog immediately
                this.route.queryParamMap.subscribe(paramMap => {
                    const productName = paramMap.get('productName');
                    if (productName) {
                        const product = products.find(p => {
                            return productName.toLowerCase() === (p.Name || '').toLowerCase();
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
            product['_isBought'] = purchases.some(p => p.ProductID === product.ID);
            return product;
        });

        this.extensions = this.extensions.map(extension => {
            extension['_isBought'] = purchases.some(p => p.ProductID === extension.ID);
            return extension;
        });
    }

    private setActivationFunction(product: ElsaProduct) {
        const name = product && product.Name && product.Name.toLowerCase();
        let activationModal;

        if (name === 'invoiceprint' && !this.ehfService.isInvoicePrintActivated(this.companySettings)) {
            activationModal = UniActivateInvoicePrintModal;
        } else if (name === 'ehf' && !this.ehfService.isEHFActivated(this.companySettings)) {
            activationModal = UniActivateAPModal;
        } else if (name === 'ocr-scan' && !this.companySettings.UseOcrInterpretation) {
            activationModal = ActivateOCRModal;
        } else if (name === 'autobank' && !this.autobankAgreements.length) {
            activationModal = UniAutobankAgreementModal;
        } else if (name === 'efakturab2c' && !this.companySettings.NetsIntegrationActivated) {
            activationModal = UniActivateEInvoiceModal;
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

    openSubscribeModal(product: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: {
                product: product,
                canPurchaseProducts: this.canPurchaseProducts
            }
        });
    }

    onTabChange(tab: IUniTab) {
        if (tab.value) {
            this.filteredExtensions = this.extensions.filter(extension => {
                return extension.ParentProducts.some(pName => pName === tab.value);
            });
        } else {
            this.filteredExtensions = this.extensions;
        }
    }

    priceText(module: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(module);
    }

    manageUserPurchases(product: ElsaProduct) {
        if (this.canPurchaseProducts) {
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
        } else {
            this.modalService.open(MissingPurchasePermissionModal);
        }
    }

    purchaseExtension(product: ElsaProduct) {
        if (this.canPurchaseProducts) {
            const purchase: ElsaPurchase = {
                ID: null,
                ProductID: product.ID
            };
            this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                () => product['_isBought'] = true,
                err => this.errorService.handle(err)
            );
        } else {
            this.modalService.open(MissingPurchasePermissionModal);
        }
    }

    openLinkInNewTab(url: string) {
        if (this.isSrEnvironment) {
            window.open('https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/bestill/prisliste.html', '_blank');
        } else {
            window.open('https://www.unimicro.no/vaare-losninger/uni-economy/priser', '_blank');
        }

    }
}
