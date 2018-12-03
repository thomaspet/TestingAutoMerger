import {Component, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import {IModalOptions, IUniModal} from '../../interfaces';
import {
    UserService,
    ElsaPurchaseService,
    ElsaProductService,
    ErrorService
} from '@app/services/services';
import {User} from '@uni-entities';
import {ElsaProduct, ElsaPurchase} from '@app/models';

@Component({
    selector: 'product-purchases-modal',
    templateUrl: './product-purchases-modal.html',
    styleUrls: ['./product-purchases-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class ProductPurchasesModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    busy: boolean;
    users: User[];

    singleProductMode: boolean;
    products: ElsaProduct[];
    purchases: ElsaPurchase[];

    purchasesMatrix: any; // typeme?

    constructor(
        private errorService: ErrorService,
        private userService: UserService,
        private purchaseService: ElsaPurchaseService,
        private productService: ElsaProductService,
    ) {}

    ngOnInit() {
        const requests = [
            this.userService.GetAll(),
            this.purchaseService.getAll()
        ];

        const data = this.options.data || {};
        if (data.product) {
            this.products = [data.product];
            this.singleProductMode = true;
        } else {
            requests.push(this.productService.GetAll());
        }

        this.busy = true;
        forkJoin(requests).subscribe(
            res => {
                this.users = res[0];
                this.purchases = res[1];

                if (!this.singleProductMode) {
                    this.products = (res[2] || []).filter(product => product.isPerUser);
                }

                this.buildProductMatrix();
            },
            err => this.errorService.handle(err),
            () => this.busy = false
        );
    }

    save() {
        const updates = [];
        this.purchasesMatrix.forEach(entry => {
            entry.purchases.forEach((purchase: ElsaPurchase) => {
                if (purchase['_active'] && !purchase.ID) {
                    updates.push(purchase);
                } else if (!purchase['_active'] && purchase.ID) {
                    purchase.Deleted = true;
                    updates.push(purchase);
                }
            });
        });

        this.busy = true;
        if (updates.length) {
            this.purchaseService.massUpdate(updates).subscribe(
                res => {
                    console.log(res);
                    this.onClose.emit(true);
                },
                err => {
                    this.errorService.handle(err);
                    this.busy = false;
                }
            );
        } else {
            this.onClose.emit(false);
        }
    }

    private buildProductMatrix() {
        this.purchasesMatrix = this.users.map(user => {
            const entry = {
                userDisplayName: user.DisplayName || user.Email,
                purchases: []
            };

            entry.purchases = this.products.map(product => {
                let purchase = this.purchases.find((p) => {
                    return p.GlobalIdentity === user.GlobalIdentity
                        && p.ProductID === product.id;
                });

                if (purchase) {
                    purchase['_active'] = true;
                } else {
                    purchase = {
                        ID: null,
                        GlobalIdentity: user.GlobalIdentity,
                        ProductID: product.id,
                    };

                    purchase['_active'] = false;
                }

                return purchase;
            });

            return entry;
        });
    }
}
