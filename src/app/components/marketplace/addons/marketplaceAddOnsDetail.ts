import {Component, AfterViewInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminProductService, AdminProduct} from '../../../services/admin/adminProductService';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../../services/common/errorService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'uni-marketplace-add-ons-details',
    templateUrl: './marketplaceAddOnsDetails.html'
})
export class MarketplaceAddOnsDetails implements AfterViewInit {
    public product$: Observable<AdminProduct>;
    public suggestedProducts$: Observable<AdminProduct[]>;

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private adminProductService: AdminProductService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    public ngAfterViewInit() {
        this.route.params.subscribe(params => {
            const productID = +params['id'];

            this.tabService.addTab({
                name: 'Markedsplass',
                url: `/marketplace/add-ons/${params['id']}`,
                moduleID: UniModules.Marketplace,
                active: true
            });

            this.product$ = this.adminProductService
                .GetAll()
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                .map(products => {
                    for (const product of products) {
                        if (product.id === productID) {
                            return product;
                        }
                        for (const subProduct of product.subProducts || []) {
                            if (subProduct.id === productID) {
                                return subProduct;
                            }
                        }
                    }
                    this.router.navigateByUrl('/marketplace');
                });

            this.suggestedProducts$ = this.adminProductService
                .GetAll()
                .map(products => products.filter(product => product.id !== productID))
                .map(products => products.filter(product => !product.isBundle))
                .map(products => this.adminProductService.maxChar(products, 120))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        });
    }

    public navigateTo(url: string) {
        this.router.navigateByUrl(url);
    }

    public buy(product: AdminProduct) {
        this.adminProductService
            .PurchaseProduct(product)
            .subscribe(
                result => result
                    ? this.toastService.addToast(
                        `Kjøpte produktet: ${product.label}`, ToastType.good, ToastTime.short
                    )
                    : this.toastService.addToast(
                        `Fikk ikke kjøpt produktet pga en feil oppstod`, ToastType.bad, ToastTime.short
                    )
            );
    }
}
