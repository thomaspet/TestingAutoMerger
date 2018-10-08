import {Component, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ElsaProductService, ErrorService} from '@app/services/services';
import {ElsaProduct, ElsaProductType, ElsaBundle} from '@app/services/elsa/elsaModels';
import {ModuleSubscribeModal} from '@app/components/marketplace/modules/subscribe-modal/subscribe-modal';
import {UniModalService, ManageProductsModal} from '@uni-framework/uni-modal';
import {IUniTab} from '@app/components/layout/uniTabs/uniTabs';
import {Observable} from 'rxjs';
import {ElsaBundleService} from '@app/services/elsa/elsaBundleService';
import {Company} from '@app/unientities';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';


@Component({
    selector: 'uni-marketplace-modules',
    templateUrl: './marketplaceModules.html',
    styleUrls: ['./marketplaceModules.sass'],
})
export class MarketplaceModules implements AfterViewInit {
    modules: ElsaProduct[];
    bundles: ElsaProduct[];
    modulesWithExtensions: ElsaProduct[];
    currentExtensions: ElsaProduct[];
    tabs: IUniTab[];

    constructor(
        tabService: TabService,
        private elsaProductService: ElsaProductService,
        private elsaBundleService: ElsaBundleService,
        private errorService: ErrorService,
        private router: Router,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
    ) {
        tabService.addTab({
            name: 'Markedsplass', url: '/marketplace/modules', moduleID: UniModules.Marketplace, active: true
        });
    }

    ngAfterViewInit() {
        const isModule = product => product.productType === ElsaProductType.Module;
        const hasSubProducts = product => product.subProducts.length > 0;
        Observable.forkJoin(
            this.elsaProductService.GetAll(),
            this.elsaBundleService.GetAll(),
        )
            .subscribe(
                obs => {
                    const [products, bundles] = obs;
                    this.modules = products.filter(isModule);
                    this.bundles = bundles;
                    this.modulesWithExtensions = products.filter(hasSubProducts);
                    this.tabs = this.modulesWithExtensions.map(m => ({name: m.name}))
                },
                err => this.errorService.handle(err),
            );
    }

    navigateTo(url: string) {
        this.router.navigateByUrl(url);
    }

    openSubscribeModal(module: ElsaProduct) {
        return this.modalService.open(ModuleSubscribeModal, {data: module}).onClose
            .subscribe(() => {});
    }

    tagChanged(tabIndex: number) {
        this.currentExtensions = this.modulesWithExtensions[tabIndex].subProducts;
    }

    priceText(module: ElsaProduct): string {
        return this.elsaProductService.ProductTypeToPriceText(module);
    }

    editPurchases() {
        const company: Company = this.browserStorage.getItem('activeCompany');
        this.modalService
            .open(ManageProductsModal, {
                header: `Velg hvilke brukere som skal ha hvilke produkter i ${company.Name}`,
                data: {companyKey: company.Key},
            });
    }

    bundleFullPrice(bundle: ElsaBundle): number {
        return bundle.products.map(p => p.price).reduce((a, b) => a + b, 0);
    }
}
