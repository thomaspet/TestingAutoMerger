import {Component, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, forkJoin} from 'rxjs';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType, ElsaContractType} from '@app/models';
import {
    ElsaProductService,
    ElsaPurchaseService,
    ErrorService,
    CompanySettingsService,
    EHFService,
    PaymentBatchService,
    UserRoleService,
    ElsaContractService,
} from '@app/services/services';
import {
    UniModalService,
    ActivateOCRModal,
    UniActivateAPModal,
    UniActivateEInvoiceModal,
    UniActivateInvoicePrintModal,
    ProductPurchasesModal,
    UniAutobankAgreementModal,
    MissingPurchasePermissionModal,
    PurchaseTraveltextModal,
    ConfirmActions
} from '@uni-framework/uni-modal';

import {CompanySettings} from '@uni-entities';
import {ActivationEnum, ElsaPurchase} from '@app/models';
// import {IUniTab} from '@uni-framework/uni-tabs';
import {theme, THEMES} from 'src/themes/theme';
import {take} from 'rxjs/operators';
import {ChangeContractTypeModal} from './change-contract-type-modal/change-contract-type-modal';

@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    modules: ElsaProduct[];
    extensions: ElsaProduct[];
    // filteredExtensions: ElsaProduct[];
    // tabs: IUniTab[];

    private canPurchaseProducts: boolean;
    private companySettings: CompanySettings;
    private autobankAgreements: any[];

    contractTypes: ElsaContractType[];

    priceListLink: string;

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private userRoleService: UserRoleService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: UniModalService,
        private ehfService: EHFService,
        private paymentBatchService: PaymentBatchService,
        private elsaContractService: ElsaContractService,
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/modules', moduleID: UniModules.Marketplace, active: true
        });

        if (theme.theme === THEMES.UE) {
            this.priceListLink = 'https://www.unimicro.no/vaare-losninger/uni-economy/priser';
        } else if (theme.theme === THEMES.SR) {
            this.priceListLink = 'https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/bestill/prisliste.html';
        }
    }

    ngAfterViewInit() {
        // this.authService.authentication$.pipe(take(1)).subscribe(auth => {
        //     if (auth.isDemo) {

        //     }
        // });

        forkJoin(
            this.elsaContractService.getCustomContractTypes(),
            this.elsaContractService.getValidContractTypeUpgrades(),
        ).subscribe(([contractTypes, validUpgrades]) => {
            const currentContractType = this.authService.currentUser.License?.ContractType?.TypeID;

            this.contractTypes = contractTypes?.map(contractType => {
                contractType['_isActive'] = contractType.ContractType === currentContractType;

                contractType['_isValidUpgrade'] = !contractType['_isActive']
                    && validUpgrades?.some(typeID => typeID === contractType.ContractType);

                return contractType;
            });

            this.loadData();
        });
    }

    private loadData() {
        const userID = this.authService.currentUser.ID;

        forkJoin(
            this.companySettingsService.Get(1),
            this.paymentBatchService.checkAutoBankAgreement()
                .catch(() => Observable.of([])), // fail silently

            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll(),
            this.userRoleService.hasAdminRole(userID),
        ).subscribe(
            ([companySettings, autobankAgreeements, products, purchases, canPurchaseProducts]) => {
                this.companySettings = companySettings;

                if (!this.companySettings.OrganizationNumber) {
                    this.modalService.confirm({
                        header: 'Kan ikke kjøpe produkter',
                        message: 'Organisasjonsnummer mangler på selskapet. Du kan endre dette i firmainnstillinger.',
                        buttonLabels: {
                            accept: 'Gå til firmainnstillinger',
                            reject: 'Avbryt'
                        }
                    }).onClose.subscribe((action: ConfirmActions) => {
                        if (action === ConfirmActions.ACCEPT) {
                            this.router.navigateByUrl('/settings/company');
                        }
                    });
                }

                this.autobankAgreements = autobankAgreeements || [];

                this.modules = (products || []).filter(p => p.ProductType === ElsaProductType.Module);

                this.extensions = products
                    .filter(p => p.ProductType === ElsaProductType.Extension)
                    .map(extension => {
                        this.setActivationFunction(extension);
                        return extension;
                    });

                this.setPurchaseInfo(purchases);
                this.canPurchaseProducts = canPurchaseProducts;

                // const tabs = this.modules.map(m => ({name: m.Label, value: m.Name}));
                // tabs.unshift({ name: 'Alle', value: null });
                // this.tabs = tabs;
                // this.onTabChange(this.tabs[0]);

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

    changeContractType(contractType: ElsaContractType) {
        this.modalService.open(ChangeContractTypeModal, { data: contractType });
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

        if (name === 'invoiceprint' && !this.ehfService.isInvoicePrintActivated()) {
            activationModal = UniActivateInvoicePrintModal;
        } else if (name === 'ehf' && !this.ehfService.isEHFActivated()) {
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
                canPurchaseProducts: this.canPurchaseProducts,
            }
        });
    }

    // onTabChange(tab: IUniTab) {
    //     if (tab.value) {
    //         this.filteredExtensions = this.extensions.filter(extension => {
    //             return extension.ParentProducts.some(pName => pName === tab.value);
    //         });
    //     } else {
    //         this.filteredExtensions = this.extensions;
    //     }
    // }

    priceText(module: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(module);
    }

    manageUserPurchases(product: ElsaProduct) {
        if (this.canPurchaseProducts) {
            const purchaseModal = product.Name.trim().toLowerCase() === 'traveltext'
                ? PurchaseTraveltextModal
                : ProductPurchasesModal;
            this.modalService.open(purchaseModal, {
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
                () => {
                    product['_isBought'] = true;
                    if (product['_activationFunction']) {
                        product['_activationFunction'].click();
                    }
                },
                err => this.errorService.handle(err)
            );
        } else {
            this.modalService.open(MissingPurchasePermissionModal);
        }
    }
}
