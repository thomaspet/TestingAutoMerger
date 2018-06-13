import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {
    ElsaPurchaseService,
    ElsaPurchasesForUserLicenseByCompany,
    ElsaPurchase,
    ElsaPurchaseForCompany, ElsaPurchaseForUserLicense
} from '@app/services/elsa/elsaPurchasesService';
import {ErrorService} from '@app/services/common/errorService';
import {Observable} from 'rxjs';
import {ElsaProductService, ElsaProduct} from '@app/services/elsa/elsaProductService';
import {ElsaCompanyLicenseService, ElsaPurchaseForLicense} from '@app/services/elsa/elsaCompanyLicenseService';
import {IModalOptions, IUniModal} from '../interfaces';

interface UserLine   {
    userLicenseID: number;
    userName: string;
    purchases: ElsaPurchasesForUserLicenseByCompany[];
}

@Component({
    selector: 'manage-products-modal',
    template: `
        <section role="dialog" class="uni-modal"
                (keydown.esc)="close()">
            <header>
                <h1>{{options.header}}&nbsp;</h1>
            </header>
            <article>
                <main>
                    <p *ngIf="purchasesPerUser?.length === 0; else productTable">
                        Dette selskapet er ikke synkronisert inn i lisens systemet enda, forsøk igjen senere!
                    </p>
                    <ng-template #productTable>
                        <table *ngIf="!!products"
                               class="manage-products-table">
                            <tr>
                                <th class="username-cell">
                                    Brukere
                                </th>
                                <th *ngFor="let product of products"
                                    class="matrix-cell">
                                    {{product.name}}
                                </th>
                            </tr>
                            <tr *ngFor="let userPurchase of purchasesPerUser">
                                <td class="username-cell">
                                    {{userPurchase.userName}}
                                </td>
                                <td *ngFor="let purchase of userPurchase.purchases"
                                    class="matrix-cell">
                                    <i class="material-icons"
                                       *ngIf="!purchase._loading"
                                       [ngClass]="{
                                           'checkmark-bought': purchase.isAssigned,
                                           'checkmark-unbought': !purchase.isAssigned
                                       }"
                                       (click)="toggleProduct(purchase)">
                                    </i>
                                    <i class="material-icons"
                                       *ngIf="purchase._loading">sync</i>
                                </td>
                            </tr>
                        </table>
                    </ng-template>
                </main>
            </article>
            <footer>
                <button class="good" (click)="close()">Lukk</button>
            </footer>
        </section>
    `
})
export class ManageProductsModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<string> = new EventEmitter<string>();

    public products: ElsaProduct[];
    public purchasesPerUser: UserLine[];
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
            throw new Error('companyKey is a required field for using the ManageProductsModal')
        }

        Observable.forkJoin(
            this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey),
            this.elsaProductService.GetAll(),
        )
            .do(() => this.cdr.markForCheck())
            .subscribe(
                parts => {
                    const licensePurchases: ElsaPurchasesForUserLicenseByCompany[] = parts[0];
                    this.products = parts[1];
                    this.purchasesPerUser = this.mapPurchasesToUsers(licensePurchases, this.products);
                },
                err => this.errorService.handle(err),
            );
    }

    private mapPurchasesToUsers(licensePurchases: ElsaPurchasesForUserLicenseByCompany[], products: ElsaProduct[]): UserLine[] {
        const userLines = this.getUserLines(licensePurchases);
        for(const userLine of userLines) {
            for(const product of products) {
                const alreadyPurchased = licensePurchases
                    .find(l => l.userLicenseID == userLine.userLicenseID && l.productID == product.id);
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

    public close() {
        this.onClose.emit();
    }

    public toggleProduct(licensePurchase: ElsaPurchasesForUserLicenseByCompany) {
        licensePurchase['_loading'] = true;
        let licensePurchaseObservable: Observable<ElsaPurchasesForUserLicenseByCompany>;
        if (!licensePurchase.purchaseForCompanyID) {
            const product = this.products.find(p => p.id === licensePurchase.productID);

            licensePurchaseObservable = this.elsaCompanyLicenseService.GetByCompanyKey(this.companyKey)
                .switchMap((companyLicense: ElsaPurchaseForLicense) =>
                    this.elsaPurchasesService
                        .PurchaseProductForContract(product.id, companyLicense.contractID)
                        .switchMap((purchase: ElsaPurchase)=>
                            this.elsaPurchasesService
                                .PurchaseProductForCompany(purchase.id, companyLicense.id)
                                .switchMap((companyPurchase: ElsaPurchaseForCompany) =>
                                    this.elsaCompanyLicenseService.PurchasesForUserLicense(this.companyKey)
                                        .do(purchases => this.purchasesPerUser = this.mapPurchasesToUsers(purchases, this.products))
                                        .map((purchases: ElsaPurchasesForUserLicenseByCompany[]) =>
                                            purchases.find(purchase =>
                                                purchase.productID === product.id
                                                && purchase.userLicenseID === licensePurchase.userLicenseID
                                            )
                                        )
                                )
                        )
                )
        } else {
            licensePurchaseObservable = Observable.of(licensePurchase)
        }
        licensePurchaseObservable.subscribe(purchase => {
            let action: Observable<ElsaPurchaseForUserLicense>;
            let buy = false;
            if (purchase.isAssigned) {
                action = this.elsaPurchasesService.RemoveProductForUser(purchase.purchaseForCompanyID, purchase.userLicenseID);
            } else {
                action = this.elsaPurchasesService.PurchaseProductForUser(purchase.purchaseForCompanyID, purchase.userLicenseID);
                buy = true;
            }
            action
                .do(() => delete purchase['_loading'])
                .do(() => this.cdr.markForCheck())
                .subscribe(
                    userPurchase => purchase.isAssigned = buy,
                    err => this.errorService.handle(err),
                );
        },
        err => this.errorService.handle(err)
        );
    }
}
