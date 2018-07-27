import {Component, AfterViewInit} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ActivatedRoute, Router} from '@angular/router';
import {ElsaProductService, ElsaPurchaseService} from '@app/services/services';
import {Observable} from 'rxjs/Observable';
import {CompanySettingsService} from '../../../services/common/companySettingsService';
import {AgreementService} from '../../../services/common/agreementService';
import {ErrorService} from '../../../services/common/errorService';
import {ToastService, ToastType, ToastTime} from '../../../../framework/uniToast/toastService';
import {UniModalService, UniActivateAPModal, UniActivateInvoicePrintModal, ConfirmActions} from '@uni-framework/uni-modal';
import {ActivationEnum} from '../../../../../src/app/models/activationEnum';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AuthService, IAuthDetails} from '@app/authService';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';
import {ElsaProduct} from '@app/services/elsa/elsaModels';

@Component({
    selector: 'uni-marketplace-add-ons-details',
    templateUrl: './marketplaceAddOnsDetails.html'
})
export class MarketplaceAddOnsDetails implements AfterViewInit {
    public product$: Observable<ElsaProduct>;
    public suggestedProducts$: Observable<ElsaProduct[]>;
    public hasBoughtProduct$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public canActivate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public numberOfUsersForProduct$: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(
        private tabService: TabService,
        private errorService: ErrorService,
        private elsaProductService: ElsaProductService,
        private elsaPurchasesService: ElsaPurchaseService,
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
        private authService: AuthService,
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

            this.product$ = this.elsaProductService
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
                .filter(product => !!product)
                .do((product: ElsaProduct) =>
                    this.elsaPurchasesService.GetAll()
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
                )
                .do((product: ElsaProduct) => this.updateNumberOfUsersForProduct(product.id));

            this.suggestedProducts$ = this.elsaProductService
                .GetAll()
                .map(products => products.filter(product => product.id !== productID))
                .map(products => products.filter(product => !product.isBundle))
                .map(products => this.elsaProductService.maxChar(products, 120))
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        });
    }

    public navigateTo(url: string) {
        this.router.navigateByUrl(url);
    }

    public buy(product: ElsaProduct) {
        this.showActivateModal(product).then(() => {
            this.elsaProductService
                .PurchaseProductOnCurrentCompany(product)
                .do(() => this.updateNumberOfUsersForProduct(product.id))
                .subscribe(
                    () => {
                        this.toastService.addToast(
                            `Kjøpte produktet: ${product.label}`, ToastType.good, ToastTime.short
                        );

                        this.hasBoughtProduct$.next(true);
                    },
                    err => {
                            this.toastService.addToast(
                            `Fikk ikke kjøpt produktet pga en feil oppstod`, ToastType.bad, ToastTime.short
                        );
                        this.errorService.handle(err);
                    });
        }).catch(err => {
            // the purchase was aborted, most likely the user didnt accept the terms for the service,
            // or something went wrong when accepting the terms
        });
    }

    public activate(product: ElsaProduct) {
        this.showActivateModal(product).then(() => {
            this.toastService.addToast(
                `Produkt: ${product.label} aktivert`, ToastType.good, ToastTime.short
            );
        }).catch(err =>{
            // the activation was aborted, most likely the user didn't accept the terms for the service,
            // or something went wrong when accepting the terms
        });
    }

    private updateNumberOfUsersForProduct(productId: number) {
        this.authService.authentication$.first().subscribe((auth: IAuthDetails) =>
            this.elsaCompanyLicenseService.PurchasesForUserLicense(auth.activeCompany.Key)
                .map(purchasesForUser => purchasesForUser
                    .reduce((counter, purchase) => purchase.productID === productId ? counter + 1 : counter, 0)
                )
                .subscribe(sum => this.numberOfUsersForProduct$.next(sum))
        )
    }

    private showActivateModal(product: ElsaProduct): Promise<any> {
        return new Promise((resolve, reject) => {
            switch (product.name) {
                case 'INVOICEPRINT':
                    this.modalService.open(UniActivateInvoicePrintModal)
                        .onClose.subscribe((response) =>
                            {
                                // if the modal is closed without the activation status indicating that the
                                // EHF/AP is activated, don't purchase the product
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
                case 'EHF':
                    this.modalService.open(UniActivateAPModal)
                        .onClose.subscribe((response) =>
                            {
                                // if the modal is closed without the activation status indicating that the
                                // EHF/AP is activated, don't purchase the product
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
