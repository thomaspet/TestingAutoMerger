import {Component, AfterViewInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminProductService, AdminProduct} from '../../../services/admin/adminProductService';
import {Observable} from 'rxjs/Observable';
import {ErrorService} from '../../../services/common/errorService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {UniModalService, UniActivateAPModal} from '@uni-framework/uniModal/barrel';

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
        private toastService: ToastService,
        private modalService: UniModalService
    ) {}

    public mapHeaderBackmapHeaderBackgroundClass(product) {
        switch (product.id) {
            case 15:
                return 'regnskap_header';
            case 16:
                return 'salg_header';
            case 17:
                return 'lonn_header';
            case 18:
                return 'time_header';
            default:
                return 'regnskap_header';
        }
    }

    public mapLaptopImage(product) {
        const path = '../../../../assets/marketplace/modules_details/';
        switch (product.id) {
            case 15:
                return path + 'laptop_regn.png';
            case 16:
                return path + 'laptop_salg.png';
            case 17:
                return path + 'laptop_lonn.png';
            case 18:
                return path + 'laptop_time.png';
            default:
                return path + 'laptop_regn.png';
        }
    }

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
                            product._backgroundClass = this.mapHeaderBackmapHeaderBackgroundClass(product);
                            product._laptopImage = this.mapLaptopImage(product);
                            return product;
                        }
                        for (const subProduct of product.subProducts || []) {
                            if (subProduct.id === productID) {
                                subProduct._backgroundClass = this.mapHeaderBackmapHeaderBackgroundClass(subProduct);
                                subProduct._laptopImage = this.mapLaptopImage(subProduct);
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
                result => {
                    if (result) {
                        this.toastService.addToast(
                            `Kjøpte produktet: ${product.label}`, ToastType.good, ToastTime.short
                        );

                        switch (product.name) {
                            case 'EHF':
                                this.modalService.open(UniActivateAPModal)
                                    .onClose.subscribe((status) => {}, err => this.errorService.handle(err));
                                break;
                        }

                    } else {
                        this.toastService.addToast(
                            `Fikk ikke kjøpt produktet pga en feil oppstod`, ToastType.bad, ToastTime.short
                        );
                    }
                }
            );
    }
}
