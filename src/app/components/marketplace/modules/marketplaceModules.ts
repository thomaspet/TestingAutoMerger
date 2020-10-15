import {Component, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, forkJoin} from 'rxjs';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType, ElsaContractType, ElsaAgreementStatus} from '@app/models';
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
import {ChangeContractTypeModal} from './change-contract-type-modal/change-contract-type-modal';

interface ActivationModal {
    modal: any;
    options?: any;
}

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
    currentContractType: number;

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

        // every else-if can be removed when we're sure every environment has set PriceListUrl in Elsa
        if (this.authService.publicSettings?.PriceListUrl) {
            this.priceListLink = this.authService.publicSettings.PriceListUrl;
        } else if (theme.theme === THEMES.UE) {
            this.priceListLink = 'https://info.unieconomy.no/priser';
        } else if (theme.theme === THEMES.SR) {
            this.priceListLink = 'https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/bestill/prisliste.html';
        } else if (theme.theme === THEMES.EXT02) {
            this.priceListLink = 'https://www.dnb.no/bedrift/priser/dnbregnskap.html';
        }
    }

    ngAfterViewInit() {
        forkJoin([
            this.elsaContractService.getCustomContractTypes(),
            this.elsaContractService.getValidContractTypeUpgrades()
        ]).subscribe(([contractTypes, validUpgrades]) => {
            this.currentContractType = this.authService.currentUser.License?.ContractType?.TypeID;

            this.contractTypes = contractTypes?.map(contractType => {
                contractType['_isActive'] = contractType.ContractType === this.currentContractType;

                contractType['_isValidUpgrade'] = !contractType['_isActive']
                    && validUpgrades?.some(typeID => typeID === contractType.ContractType);

                return contractType;
            });

            this.loadData();
        });
    }

    private loadData() {
        const userID = this.authService.currentUser.ID;

        forkJoin([
            this.companySettingsService.Get(1),
            this.paymentBatchService.checkAutoBankAgreement()
                .catch(() => Observable.of([])), // fail silently

            this.elsaProductService.getProductsOnContractTypes(this.currentContractType, `producttype ne 'Package'`),
            this.elsaPurchaseService.getAll(),
            this.userRoleService.hasAdminRole(userID)
        ]).subscribe(
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

                this.modules = (products || []).filter(p => p.ProductType === ElsaProductType.Module && !p.IsMandatoryProduct);

                this.extensions = products
                    .filter(p => p.ProductType === ElsaProductType.Extension && !p.IsMandatoryProduct)
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
        let activationModal: ActivationModal;

        if (name === 'invoiceprint' && !this.ehfService.isInvoicePrintActivated()) {
            activationModal = {modal: UniActivateInvoicePrintModal};
        } else if (name === 'ehf' && !this.ehfService.isEHFIncomingActivated()) {
            activationModal = {modal: UniActivateAPModal, options: {data: {isOutgoing: false}}};
        } else if (name === 'ehf_out' && !this.ehfService.isEHFOutActivated()) {
            activationModal = {modal: UniActivateAPModal, options: {data: {isOutgoing: true}}};
        } else if (
            name === 'ocr-scan'
            && !this.companySettings.UseOcrInterpretation
            && product.ProductAgreement?.AgreementStatus === ElsaAgreementStatus.Active
        ) {
            activationModal = {modal: ActivateOCRModal, options: {data: product}};
        } else if (name === 'autobank' && !this.autobankAgreements.length) {
            activationModal = {modal: UniAutobankAgreementModal};
        } else if (name === 'efakturab2c' && !this.companySettings.NetsIntegrationActivated) {
            activationModal = {modal: UniActivateEInvoiceModal};
        }

        if (activationModal) {
            product['_activationFunction'] = {
                label: 'Aktiver',
                click: () => {
                    this.modalService.open(activationModal.modal, activationModal.options).onClose.subscribe(res => {
                        if (res && res !== ActivationEnum.NOT_ACTIVATED) {
                            product['_activationFunction'] = undefined;
                        }
                    });
                }
            };
        }

        // ocr-scan is not activated, and there is no active agreement
        if (!activationModal && name === 'ocr-scan' && !this.companySettings.UseOcrInterpretation) {
            product['_activationFunction'] = {
                label: 'Aktiver',
                click: () => this.activateOcrScan(product)
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
            if (!product['_isBought'] && product.ProductAgreement?.AgreementStatus === ElsaAgreementStatus.Active) {
                this.modalService.confirm({
                    header: product.ProductAgreement.Name,
                    message: product.ProductAgreement.AgreementText,
                    isMarkdown: true,
                    class: 'medium',
                    buttonLabels: {
                        accept: 'Aksepter',
                        cancel: 'Tilbake'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.openUserPurchases(product);
                    }
                });
            } else {
                this.openUserPurchases(product);
            }
        } else {
            this.modalService.open(MissingPurchasePermissionModal);
        }
    }

    openUserPurchases(product: ElsaProduct) {
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
    }

    purchaseExtension(product: ElsaProduct) {
        if (this.canPurchaseProducts) {
            const purchase: ElsaPurchase = {
                ID: null,
                ProductID: product.ID
            };
            // if the extension has a special activationFunction, we show the agreement inside that function
            if (!product['_isBought'] && product.ProductAgreement?.AgreementStatus === ElsaAgreementStatus.Active && !product['_activationFunction']) {
                this.modalService.confirm({
                    header: product.ProductAgreement.Name,
                    message: product.ProductAgreement.AgreementText,
                    isMarkdown: true,
                    class: 'medium',
                    buttonLabels: {
                        accept: 'Aksepter',
                        cancel: 'Tilbake'
                    }
                }).onClose.subscribe(response => {
                    if (response === ConfirmActions.ACCEPT) {
                        this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                            () => product['_isBought'] = true,
                            err => this.errorService.handle(err)
                        );
                    }
                });
            } else {
                this.elsaPurchaseService.massUpdate([purchase]).subscribe(
                    () => {
                        product['_isBought'] = true;
                        if (product['_activationFunction']) {
                            product['_activationFunction'].click();
                        }
                    },
                    err => this.errorService.handle(err)
                );
            }
        } else {
            this.modalService.open(MissingPurchasePermissionModal);
        }
    }

    activateOcrScan(product: ElsaProduct) {
        this.companySettingsService.PostAction(1, 'accept-ocr-agreement').subscribe(
            () => product['_activationFunction'] = undefined,
            err => this.errorService.handle(err)
        );
    }
}
