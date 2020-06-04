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
import {ElsaProduct, ElsaPurchase, ElsaProductType} from '@app/models';
import {FormControl} from '@angular/forms';

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

    checkAll: boolean;
    filterControl: FormControl = new FormControl('');
    purchasesMatrix: any[];

    singleProductMode: boolean;
    products: ElsaProduct[];
    purchases: ElsaPurchase[];
    userRoles: UserRole[];
    roles: Role[];

    allPurchasesMatrix: {
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
    ) {
        this.filterControl.valueChanges
            .debounceTime(200)
            .distinctUntilChanged()
            .subscribe(value => this.filterItems(value));
    }

    ngOnInit() {
        this.busy = true;
        const data = this.options.data || {};
        let productRequest: Observable<ElsaProduct[]>;

        if (data.product) {
            this.singleProductMode = true;
            productRequest = Observable.of([data.product]);
        } else {
            productRequest = this.productService.getProductsOnContractType();
        }

        forkJoin(
            this.userService.GetAll(),
            this.purchaseService.getAll(),
            productRequest,
            this.userRoleService.GetAll(),
            this.roleService.GetAll()
        ).subscribe(
            res => {
                this.users = res[0].filter(user => user.Email && user.StatusCode !== 110000);
                this.purchases = res[1];
                this.products = (res[2] || []).filter(product => {
                    return product.IsPerUser && (
                        product.ProductType === ElsaProductType.Module
                        || product.ProductType === ElsaProductType.Package
                    );
                });
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

                    const product = this.products.find(p => p.ID === purchase.ProductID);
                    const rolesOnProduct: string[] = product && product.ListOfRoles
                        ? product.ListOfRoles.split(',') : [];

                    // Check if the user already has a role for the activated product
                    const hasRoleForProduct = this.userRoles.find(role => {
                        const sharedRoleName = (role.SharedRoleName || '').toLowerCase();
                        return role.UserID === entry.userID && rolesOnProduct.some(roleName => {
                            return roleName.trim().toLowerCase() === sharedRoleName;
                        });
                    });

                    // If the above check is false we need to assign them the default role(s) for said product
                    if (!hasRoleForProduct && rolesOnProduct.length) {
                        let rolesToActivate = [];

                        if (product.DefaultRoles) {
                            const defaultRoles = product.DefaultRoles.toLowerCase();
                            rolesToActivate = this.roles.filter(role => defaultRoles.includes(role.Name.toLowerCase()));
                        }

                        if (!rolesToActivate.length) {
                            const defaultRoleName = rolesOnProduct[0].trim().toLowerCase();
                            const defaultRole = this.roles.find(role => {
                                return (role.Name || '').toLowerCase() === defaultRoleName;
                            });

                            if (defaultRole) {
                                rolesToActivate.push(defaultRole);
                            }
                        }

                        if (rolesToActivate.length) {
                            const userRoles = rolesToActivate.map(role => {
                                return {
                                    SharedRoleId: role.ID,
                                    SharedRoleName: role.Name,
                                    UserID: entry.userID
                                };
                            });

                            newUserRoles.push(...userRoles);
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
        this.purchasesMatrix = this.allPurchasesMatrix = this.users.map(user => {
            const entry = {
                userID: user.ID,
                userDisplayName: user.DisplayName || user.Email,
                purchases: []
            };

            entry.purchases = this.products.map(product => {
                let purchase = this.purchases.find((p) => {
                    return p.GlobalIdentity === user.GlobalIdentity
                        && p.ProductID === product.ID;
                });

                if (purchase) {
                    purchase['_active'] = true;
                } else {
                    purchase = {
                        ID: null,
                        GlobalIdentity: user.GlobalIdentity,
                        ProductID: product.ID,
                    };

                    purchase['_active'] = false;
                }

                return purchase;
            });

            return entry;
        });
    }

    onCheckAllChange() {
        this.checkAll = !this.checkAll;
        this.purchasesMatrix.forEach(item => item.purchases[0]['_active'] = this.checkAll);
    }


    private filterItems(filterText: string) {
        const filterLowerCase = filterText.toLowerCase();
        this.purchasesMatrix = this.allPurchasesMatrix.filter(item => {
            return item.userDisplayName.toLowerCase().includes(filterLowerCase);
        });
    }
}
