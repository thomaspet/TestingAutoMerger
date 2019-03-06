import {Component, EventEmitter} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {IModalOptions, IUniModal} from '../../interfaces';
import {
    UserService,
    ElsaPurchaseService,
    ElsaProductService,
    ErrorService,
    UserRoleService,
    RoleService
} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {User, UserRole, Role} from '@uni-entities';
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
    userRoles: UserRole[];
    roles: Role[];

    purchasesMatrix: {
        userID: number,
        userDisplayName: string,
        purchases: ElsaPurchase[]
    }[];

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService,
        private userService: UserService,
        private purchaseService: ElsaPurchaseService,
        private productService: ElsaProductService,
        private userRoleService: UserRoleService,
        private roleService: RoleService,
    ) {}

    ngOnInit() {
        this.busy = true;
        const data = this.options.data || {};
        let productRequest: Observable<ElsaProduct[]>;

        if (data.product) {
            this.singleProductMode = true;
            productRequest = Observable.of([data.product]);
        } else {
            productRequest = this.productService.GetAll();
        }

        forkJoin(
            this.userService.GetAll(),
            this.purchaseService.getAll(),
            productRequest,
            this.userRoleService.GetAll(),
            this.roleService.GetAll()
        ).subscribe(
            res => {
                this.users = res[0];
                this.purchases = res[1];
                this.products = (res[2] || []).filter(product => product.isPerUser);
                this.userRoles = res[3];
                this.roles = res[4];

                this.buildProductMatrix();
                this.busy = false;
            },
            err => {
                this.busy = false;
                this.errorService.handle(err);
            },
        );
    }

    save() {
        const newUserRoles: Partial<UserRole>[] = [];
        const updates = [];
        this.purchasesMatrix.forEach(entry => {
            entry.purchases.forEach((purchase: ElsaPurchase) => {
                if (purchase['_active'] && !purchase.ID) {
                    updates.push(purchase);

                    // If the user doesn't already have a role for this product
                    // we also need to give them the default role for it
                    const product = this.products.find(p => p.id === purchase.ProductID);
                    const hasRoleForProduct = this.userRoles.find(role => {
                        const sharedRoleName = (role.SharedRoleName || '').toLowerCase();
                        const productName = (product && product.name || '').toLowerCase();
                        return role.UserID === entry.userID && sharedRoleName.includes(productName);
                    });

                    if (!hasRoleForProduct) {
                        const defaultRole = this.roles.find(role => {
                            return product.listOfRoles && product.listOfRoles.includes(role.Name);
                        });

                        if (defaultRole) {
                            newUserRoles.push({
                                SharedRoleId: defaultRole.ID,
                                SharedRoleName: defaultRole.Name,
                                UserID: entry.userID
                            });
                        }
                    }
                } else if (!purchase['_active'] && purchase.ID) {
                    purchase.Deleted = true;
                    updates.push(purchase);
                }
            });
        });

        this.busy = true;
        if (updates.length) {
            this.purchaseService.massUpdate(updates).subscribe(
                () => {
                    if (newUserRoles && newUserRoles.length) {
                        this.userRoleService.bulkUpdate(newUserRoles).subscribe(
                            () => this.onClose.emit(true),
                            () => {
                                this.toastService.addToast(
                                    'Kunne ikke sette standardrolle basert på produkt',
                                    ToastType.warn, 0,
                                    `
                                    Det kan være lurt å sjekke at tilgangsnivået til brukerne er slik du ønsker.<br><br>
                                    Dette gjøres i Innstillinger > Brukere ved å klikke på "Roller og tilganger"
                                    `
                                );

                                this.onClose.emit(true);
                            }
                        );
                    } else {
                        this.onClose.emit(true);
                    }
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
        this.purchasesMatrix = this.users.filter(user => user.StatusCode !== 110000).map(user => {
            const entry = {
                userID: user.ID,
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
