import {Component, OnInit} from '@angular/core';
import {Observable, forkJoin} from 'rxjs';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {AuthService} from '@app/authService';
import {ElsaProduct, ElsaProductType, ElsaPurchaseStatus} from '@app/models';
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
    PurchaseTraveltextModal
} from '@uni-framework/uni-modal';

import {environment} from 'src/environments/environment';

import {CompanySettings} from '@uni-entities';
import {ActivationEnum, ElsaPurchase} from '@app/models';
import {IUniTab} from '@uni-framework/uni-tabs';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'uni-product-purchases',
    templateUrl: './productPurchases.html',
    styleUrls: ['./productPurchases.sass'],
})
export class ProductPurchases implements OnInit {

    busy: boolean;
    isAdmin: boolean;
    isSrEnvironment = environment.isSrEnvironment;

    products: ElsaProduct[];
    purchases: ElsaPurchase[];
    filteredProducts: ElsaProduct[];

    autobankAgreements: any[];
    companySettings: CompanySettings;

    filterControl: FormControl = new FormControl('');

    selectedType: ElsaProductType;
    productType = ElsaProductType;

    tabs: IUniTab[] = [
        {name: 'Alle', value: ElsaProductType.All, count: 0},
        {name: 'Moduler', value: ElsaProductType.Module, count: 0},
        {name: 'Utvidelser', value: ElsaProductType.Extension, count: 0},
        {name: 'Integrasjoner', value: ElsaProductType.Integration, count: 0},
    ];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private userRoleService: UserRoleService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private ehfService: EHFService,
        private paymentBatchService: PaymentBatchService,
    ) {
        tabService.addTab({
            name: 'Produktkjøp', url: '/marketplace/purchases', moduleID: UniModules.Marketplace, active: true
        });

        this.filterControl.valueChanges
            .debounceTime(200)
            .distinctUntilChanged()
            .subscribe(value => this.filterProducts(value));
    }

    ngOnInit() {
        this.busy = true;
        this.userRoleService.hasAdminRole(this.authService.currentUser.ID).subscribe(isAdmin => {
            this.isAdmin = isAdmin;
            if (this.isAdmin) {
                this.fetchPurchases();
            } else {
                this.busy = false;
            }
        });
    }

    fetchPurchases() {
        forkJoin(
            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll(),
            this.companySettingsService.Get(1),
            this.paymentBatchService.checkAutoBankAgreement()
                .catch(() => Observable.of([])), // fail silently
        ).subscribe(
            res => {
                this.products = res[0] || [];
                this.purchases = res[1] || [];
                this.companySettings = res[2];
                this.autobankAgreements = res[3] || [];

                this.products = this.products
                    .filter(product => this.purchases.some(purchase => purchase.ProductID === product.ID))
                    .map(product => {
                        if (product.ProductType === ElsaProductType.Extension) {
                            this.setActivationFunction(product);
                        }
                        product['_purchaseStatus'] = this.setPurchaseStatusOnProduct(product);
                        return product;
                    });

                this.setCountsByProductType();
                this.onTabChange(this.tabs[0]);

                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    setPurchaseStatusOnProduct(product: ElsaProduct) {
        if (product['_activationFunction']) {
            return ElsaPurchaseStatus.Pending;
        }
        return ElsaPurchaseStatus.Accepted;
    }

    setCountsByProductType() {
        this.tabs.forEach(tab => {
            if (tab.value === this.productType.All) {
                tab.count = this.products.length;
            } else {
                tab.count = this.products.filter(p => p.ProductType === tab.value).length;
            }
        });
    }

    setActivationFunction(product: ElsaProduct) {
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

    activatePurchasedProduct(product: ElsaProduct) {
        if (product['_activationFunction']) {
            product['_activationFunction'].click();
        }
    }

    deactivatePurchase(product: ElsaProduct) {
        if (product.ProductType === ElsaProductType.Module) {
            this.manageUserPurchases(product);
        } else {
            this.elsaPurchaseService.cancelPurchase(product.ID).subscribe(() => {
                this.products = this.products.filter(p => p.ID !== product.ID);
                this.filteredProducts = this.filteredProducts.filter(p => p.ID !== product.ID);
                this.setCountsByProductType();
            },
                err => this.errorService.handle(err)
            );
        }
    }

    manageUserPurchases(product: ElsaProduct) {
        product['_isBought'] = true;
        const purchaseModal = product.Name.trim().toLowerCase() === 'traveltext'
                ? PurchaseTraveltextModal
                : ProductPurchasesModal;
        this.modalService.open(purchaseModal, {
            data: {
                product: product
            }
        }).onClose.subscribe(changesMade => {
            if (changesMade) {
                this.fetchPurchases();
            }
        });
    }

    onTabChange(tab: IUniTab) {
        if (tab.value === this.productType.All) {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(p => p.ProductType === tab.value);
        }
        this.selectedType = tab.value;
    }

    private filterProducts(filterText: string) {
        const filterLowerCase = filterText.toLowerCase();
        this.filteredProducts = this.products.filter(product => {
            if (this.selectedType === ElsaProductType.All) {
                return product.Label.toLowerCase().includes(filterLowerCase);
            }
            return product.Label.toLowerCase().includes(filterLowerCase) && product.ProductType === this.selectedType;
        });
    }
}
