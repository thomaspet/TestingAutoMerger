import {Component, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {ElsaPurchaseService} from '@app/services/elsa/elsaPurchasesService';
import {ErrorService} from '@app/services/common/errorService';
import {Observable} from 'rxjs/Rx';
import {ElsaProductService} from '@app/services/elsa/elsaProductService';
import {ElsaCompanyLicenseService} from '@app/services/elsa/elsaCompanyLicenseService';
import {IModalOptions, IUniModal} from '../interfaces';
import {
    ElsaPurchasesForUserLicenseByCompany,
    ElsaPurchaseForUserLicense,
    ElsaPurchaseForCompany,
    ElsaPurchase,
    ElsaProduct,
    ElsaPurchaseForLicense
} from '@app/services/elsa/elsaModels';

interface UserLine   {
    userLicenseID: number;
    userName: string;
    purchases: ElsaPurchasesForUserLicenseByCompany[];
}

@Component({
    selector: 'manage-products-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Produkttilganger</h1>
            </header>
            <article>
                <p *ngIf="purchasesPerUser?.length === 0; else productTable">
                    Klarte ikke hente kjøpshistorikk. Har du tilgang til å kjøpe produkter?
                </p>
                <ng-template #productTable>
                    <table *ngIf="products && purchasesPerUser" class="manage-products-table">
                        <thead>
                            <tr>
                                <th class="username-cell">
                                    Brukere
                                </th>
                                <th *ngFor="let product of products">
                                    {{product.label}}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr *ngFor="let userPurchase of purchasesPerUser">
                                <td class="username-cell">
                                    {{userPurchase.userName}}
                                </td>
                                <td *ngFor="let purchase of userPurchase.purchases">
                                    <i class="material-icons"
                                        [ngClass]="{'active': purchase.isAssigned}"
                                        (click)="toggleProduct(purchase)">
                                        {{purchase.isAssigned ? 'check_box' : 'check_box_outline_blank'}}
                                    </i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </ng-template>
            </article>
        </section>
    `
})
export class ManageProductsModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<string> = new EventEmitter<string>();

    products: ElsaProduct[] = [];
    purchasesPerUser: UserLine[];
    private companyKey: string;

    constructor(
        private elsaPurchasesService: ElsaPurchaseService,
        private elsaProductService: ElsaProductService,
        private errorService: ErrorService,
        private cdr: ChangeDetectorRef,
        private elsaCompanyLicenseService: ElsaCompanyLicenseService,
    ) {}

    public ngOnInit() {
        this.companyKey = this.options.data.companyKey;
        if (!this.companyKey) {
            throw new Error('companyKey is a required field for using the ManageProductsModal');
        }
        const selectedProduct: ElsaProduct = this.options.data.selectedProduct;

        Observable.forkJoin(
            this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey)
                .catch(() => {
                    return Observable.of(<ElsaPurchasesForUserLicenseByCompany[]>[]);
                }),
            selectedProduct ? Observable.of(null) : this.elsaProductService.GetAll(),
        )
            .do(() => this.cdr.markForCheck())
            .subscribe(
                parts => {
                    const licensePurchases: ElsaPurchasesForUserLicenseByCompany[] = parts[0];
                    this.products = parts[1] ?
                        parts[1].filter(product => product.isPerUser && product.name !== 'Complete') :
                        [selectedProduct];
                    this.purchasesPerUser = this.mapPurchasesToUsers(licensePurchases, this.products);
                },
                err => {
                    if (err.status === 0) {
                        err.message = `The licensing server might be down, please try again later.`;
                    }
                    this.errorService.handle(err);
                },
            );
    }

    private mapPurchasesToUsers(licensePurchases: ElsaPurchasesForUserLicenseByCompany[], products: ElsaProduct[]): UserLine[] {
        const userLines = this.getUserLines(licensePurchases);
        for (const userLine of userLines) {
            for (const product of products) {
                const alreadyPurchased = licensePurchases
                    .find(l => l.userLicenseID === userLine.userLicenseID && l.productID === product.id);
                userLine.purchases.push(alreadyPurchased || <ElsaPurchasesForUserLicenseByCompany>{
                        productName: product.name,
                        productID: product.id,
                        username: userLine.userName,
                        userLicenseID: userLine.userLicenseID,
                        purchaseForCompanyID: null,
                        contractID: null,
                        isAssigned: false,
                    });
            }
        }

        return userLines;
    }

    public getUserLines(licensePurchases: ElsaPurchasesForUserLicenseByCompany[]): UserLine[] {
        return Array.from(
            licensePurchases
                .reduce((set, purchase) => {
                    set.add(purchase.userLicenseID);
                    return set;
                }, new Set<number>())
        )
            .map(userId => ({
                userLicenseID: userId,
                userName: licensePurchases.find(l => l.userLicenseID === userId).username,
                purchases: [],
            }));
    }

    public toggleProduct(licensePurchase: ElsaPurchasesForUserLicenseByCompany) {
        let licensePurchaseObservable: Observable<ElsaPurchasesForUserLicenseByCompany>;
        if (!licensePurchase.purchaseForCompanyID) {
            const product = this.products.find(p => p.id === licensePurchase.productID);

            licensePurchaseObservable = this.elsaCompanyLicenseService.GetByCompanyKey(this.companyKey)
                .switchMap((companyLicense: ElsaPurchaseForLicense) =>
                    this.elsaPurchasesService
                        .PurchaseProductForContract(product.id, companyLicense.contractID)
                        .switchMap((purchase: ElsaPurchase) =>
                            this.elsaPurchasesService
                                .PurchaseProductForCompany(purchase.id, companyLicense.id)
                                .switchMap((companyPurchase: ElsaPurchaseForCompany) =>
                                    this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey)
                                        .do(purchases => this.purchasesPerUser = this.mapPurchasesToUsers(purchases, this.products))
                                        .map((purchases: ElsaPurchasesForUserLicenseByCompany[]) =>
                                            purchases.find(p =>
                                                p.productID === product.id
                                                && p.userLicenseID === licensePurchase.userLicenseID
                                            )
                                        )
                                )
                        )
                );
        } else {
            licensePurchaseObservable = Observable.of(licensePurchase);
        }

        licensePurchaseObservable.subscribe(
            purchase => {
                let action: Observable<ElsaPurchaseForUserLicense>;
                let buy = false;
                if (purchase.isAssigned) {
                    action = this.elsaPurchasesService.RemoveProductForUser(purchase.purchaseForCompanyID, purchase.userLicenseID);
                } else {
                    action = this.elsaPurchasesService.PurchaseProductForUser(purchase.purchaseForCompanyID, purchase.userLicenseID);
                    buy = true;
                }

                action.subscribe(
                    userPurchase => {
                        purchase.isAssigned = buy;
                        this.cdr.markForCheck();
                    },
                    err => this.errorService.handle(err),
                );
            },
            err => this.errorService.handle(err)
        );
    }
}
