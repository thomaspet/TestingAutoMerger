import {Component, AfterViewInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminProductService, AdminProduct} from '../../../services/admin/adminProductService';
import {Observable} from 'rxjs/Observable';
import {CompanySettingsService} from '../../../services/common/companySettingsService';
import {AgreementService} from '../../../services/common/agreementService';
import {ErrorService} from '../../../services/common/errorService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {UniModalService, UniActivateAPModal, ConfirmActions} from '@uni-framework/uniModal/barrel';
import {ActivationEnum} from '../../../../../src/app/models/activationEnum';
import {AdminPurchasesService} from '@app/services/admin/adminPurchasesService';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Component({
    selector: 'uni-marketplace-add-ons-details',
    templateUrl: './marketplaceAddOnsDetails.html'
})
export class MarketplaceAddOnsDetails implements AfterViewInit {
    public product$: Observable<AdminProduct>;
    public suggestedProducts$: Observable<AdminProduct[]>;
    public hasBoughtProduct$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public canActivate$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private adminProductService: AdminProductService,
        private adminPurchasesService: AdminPurchasesService,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService,
        private modalService: UniModalService,
        private agreementService: AgreementService,
        private companySettingsService: CompanySettingsService
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
                })
                .do((product: AdminProduct) =>
                    this.adminPurchasesService.GetAll()
                        .map(purchases => purchases.some(purchase => purchase.productID === product.id))
                        .subscribe(hasBoughtProduct => {
                                this.hasBoughtProduct$.next(hasBoughtProduct);
                                if (product.name === 'EHF') {
                                    this.canActivate$.next(true);
                                } else if (product.name === 'OCR-SCAN') {
                                    this.canActivate$.next(true);
                                }
                            },
                            err => this.errorService.handle(err),
                        )
                );

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
        this.activateProduct(product).then(() => {
            this.adminProductService
                .PurchaseProduct(product)
                .subscribe(
                    result => {
                        if (result) {
                            this.toastService.addToast(
                                `Kjøpte produktet: ${product.label}`, ToastType.good, ToastTime.short
                            );

                            this.hasBoughtProduct$.next(true);
                        } else {
                            this.toastService.addToast(
                                `Fikk ikke kjøpt produktet pga en feil oppstod`, ToastType.bad, ToastTime.short
                            );
                        }
                    }
                , err => this.errorService.handle(err));
        }).catch(err => {
            // the purchase was aborted, most likely the user didnt accept the terms for the service,
            // or something went wrong when accepting the terms
        });
    }

    public activate(product: AdminProduct) {
        this.activateProduct(product).then(() => {
            this.toastService.addToast(
                `Produkt: ${product.label} aktivert`, ToastType.good, ToastTime.short
            );
        }).catch(err =>{
            // the activation was aborted, most likely the user didnt accept the terms for the service,
            // or something went wrong when accepting the terms
        });
    }

    public activateProduct(product: AdminProduct): Promise<any> {
        return new Promise((resolve, reject) => {
            switch (product.name) {
                case 'EHF':
                    this.modalService.open(UniActivateAPModal)
                        .onClose.subscribe((response) =>
                            {
                                // if the modal is closed without the activation status indicating that the
                                // EHF/AP is activated, dont purchase the product
                                if (response === ActivationEnum.ACTIVATED || response === ActivationEnum.CONFIRMATION) {
                                    this.canActivate$.next(false);
                                } else {
                                    reject();
                                }
                            }
                            , err => {
                                this.errorService.handle(err)
                                reject();
                            }
                        );
                    break;
                case 'OCR-SCAN':
                    this.agreementService.Current('OCR').subscribe(message => {
                        this.modalService.confirm({
                            header: 'Betingelser',
                            message: message,
                            class: 'medium',
                            buttonLabels: {
                                accept: 'Aksepter',
                                cancel: 'Avbryt'
                            }
                        }).onClose.subscribe(response => {
                            if (response === ConfirmActions.ACCEPT) {
                                this.companySettingsService.PostAction(1, 'accept-ocr-agreement')
                                    .subscribe(acceptResp => {
                                        this.canActivate$.next(false);
                                        resolve();
                                    },
                                    err => {
                                        this.errorService.handle(err);
                                        reject();
                                    });
                            } else {
                                reject();
                            }
                        });
                    });
                    break;
                default:
                    resolve();
            }
        });
     }
}
