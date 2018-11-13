import {Component, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ElsaProductService, ElsaCompanyLicenseService, ElsaPurchaseService, ErrorService} from '@app/services/services';
import {ElsaProduct, ElsaProductType, ElsaBundle, ElsaPurchasesForUserLicenseByCompany} from '@app/services/elsa/elsaModels';
import {SubscribeModal} from '@app/components/marketplace/subscribe-modal/subscribe-modal';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {Observable} from 'rxjs';
import {ElsaBundleService} from '@app/services/elsa/elsaBundleService';
import {Company} from '@app/unientities';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {AuthService} from '@app/authService';
import {
    UniModalService,
    ManageProductsModal,
    ActivateOCRModal,
    UniActivateAPModal,

} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    modules: ElsaProduct[];
    extensions: ElsaProduct[];

    // bundles: ElsaProduct[];
    // modulesWithExtensions: ElsaProduct[];
    // currentExtensions: ElsaProduct[];
    // tabs: IUniTab[];

    constructor(
        tabService: TabService,
        private authService: AuthService,
        private elsaProductService: ElsaProductService,
        private elsaBundleService: ElsaBundleService,
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private elsaPurchaseService: ElsaPurchaseService,
        private errorService: ErrorService,
        private route: ActivatedRoute,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/modules', moduleID: UniModules.Marketplace, active: true
        });
    }

    ngAfterViewInit() {
        // const isModule = product => product.productType === ElsaProductType.Module;
        // const hasSubProducts = product => product.subProducts.length > 0;

        const companyKey = this.authService.getCompanyKey();

        // Get products first, then purchases with error handler
        // that returns empty purchases array if the request fails (missing permissions).
        // This is done because we want everyone to see the marketplace
        // with available products, even though they can't make purchases.
        this.elsaProductService.GetAll().subscribe(
            products => {

                Observable.forkJoin(
                    this.elsaCompanyLicenseService.PurchasesForUserLicense(companyKey),
                    this.elsaPurchaseService.GetAllByCompanyKey(companyKey)
                ).catch(() => {
                    return Observable.of([]);
                }).subscribe((res) => {
                    const userPurchases = res[0] || [];
                    const companyPurchases = res[1] || [];

                    const modules = products.filter(p => p.productType === ElsaProductType.Module);
                    this.modules = modules.map(product => {
                        product['_isBought'] = userPurchases.some(p => p.productID === product.id && p.isAssigned);
                        return product;
                    });

                    const extensions = products.filter(p => p.productType === ElsaProductType.Extension);
                    this.extensions = extensions.map(product => {
                        product['_isBought'] = companyPurchases.some(p => p.productID === product.id);
                        return product;
                    });

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

    openSubscribeModal(module: ElsaProduct) {
        return this.modalService.open(SubscribeModal, {
            data: module,
            closeOnClickOutside: true
        });
    }

    // tagChanged(tabIndex: number) {
    //     this.currentExtensions = this.modulesWithExtensions[tabIndex].subProducts;
    // }

    priceText(module: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(module);
    }

    // editPurchases(product) {
    //     const company: Company = this.browserStorage.getItem('activeCompany');
    //     this.modalService
    //         .open(ManageProductsModal, {
    //             header: `Velg hvilke brukere som skal ha hvilke produkter i ${company.Name}`,
    //             data: {
    //                 companyKey: company.Key,
    //                 selectedProduct: product
    //             },
    //         });
    // }

    // bundleFullPrice(bundle: ElsaBundle): number {
    //     return bundle.products.map(p => p.price).reduce((a, b) => a + b, 0);
    // }
}
