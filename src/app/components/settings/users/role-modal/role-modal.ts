import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {Observable, forkJoin, of as observableOf} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {User, Role, UserRole} from '@uni-entities';
import {
    ErrorService,
    RoleService,
    UserRoleService,
    ElsaProductService,
    ElsaPurchaseService,
} from '@app/services/services';
import {AuthService} from '@app/authService';
import {ElsaPurchase, ElsaProduct} from '@app/models';

interface IRoleGroup {
    label: string;
    roles: Role[];
    product?: ElsaProduct;
    productPurchased?: boolean;
}

@Component({
    selector: 'uni-role-modal',
    templateUrl: './role-modal.html',
    styleUrls: ['./role-modal.sass'],
    host: {'class': 'uni-redesign'}
})
export class UniRoleModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<boolean> = new EventEmitter();

    canPurchaseProducts: boolean;
    user: User;
    elsaProducts: any[];
    elsaPurchases: ElsaPurchase[];

    roleGroups: IRoleGroup[];
    busy: boolean;

    constructor(
        private authService: AuthService,
        private errorService: ErrorService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {
        const license: any = this.authService.currentUser.License || {};
        this.canPurchaseProducts = license.CustomerAgreement && license.CustomerAgreement.CanAgreeToLicense;
    }

    public ngOnInit() {
        this.user = this.options.data.user;

        this.busy = true;
        forkJoin(
            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll()
        ).subscribe(
            res => {
                this.elsaProducts = res[0];
                this.elsaPurchases = res[1];

                this.getGroupedRoles().subscribe(groups => this.roleGroups = groups);
            },
            err => this.errorService.handle(err),
            () => this.busy = false
        );
    }

    purchaseProduct(group: IRoleGroup) {
        if (group.product) {
            this.elsaPurchaseService.massUpdate([{
                ID: null,
                ProductID: group.product.id,
                GlobalIdentity: this.user.GlobalIdentity
            }]).subscribe(
                () => group.productPurchased = true,
                err => this.errorService.handle(err)
            );
        }
    }

    private getGroupedRoles(): Observable<IRoleGroup[]> {
        return forkJoin(
            this.roleService.GetAll('orderby=Label'),
            this.userRoleService.getRolesByUserID(this.user.ID)
        ).pipe(
            map(res => {
                const roles: Role[] = res[0];
                const userRoles: UserRole[] = res[1];

                userRoles.forEach(userRole => {
                    const role = roles.find(r => r.ID === userRole.SharedRoleId);
                    if (role) {
                        role['_checked'] = true;
                        role['_userRole'] = userRole;
                    }
                });

                return this.groupRolesByModule(roles);
            }),
            catchError(err => {
                this.errorService.handle(err);
                return observableOf([]);
            })
        );
    }

    onRoleClick(group: IRoleGroup, role: Role) {
        if (group.productPurchased) {
            role['_checked'] = !role['_checked'];
        }
    }

    saveRoles() {
        // Loop roles and figure out what changed (new roles added, existing roles removed)
        const addRoles: Partial<UserRole>[] = [];
        const removeRoles: Partial<UserRole>[] = [];

        this.roleGroups.forEach(group => {
            if (group.productPurchased) {
                group.roles.forEach(role => {
                    if (role['_checked'] && !role['_userRole']) {
                        addRoles.push({
                            SharedRoleId: role.ID,
                            SharedRoleName: role.Name,
                            UserID: this.user.ID
                        });
                    } else if (!role['_checked'] && role['_userRole']) {
                        removeRoles.push(role['_userRole']);
                    }
                });
            }
        });

        if (addRoles.length || removeRoles.length) {
            this.busy = true;
            this.userRoleService.bulkUpdate(addRoles, removeRoles).subscribe(
                () => this.onClose.emit(true),
                err => {
                    this.errorService.handle(err);
                    this.getGroupedRoles().subscribe(groups => {
                        this.roleGroups = groups;
                        this.busy = false;
                    });
                }
            );
        } else {
            this.onClose.emit(false);
        }
    }

    private groupRolesByModule(roles: Role[]): IRoleGroup[] {
        const products = this.elsaProducts.filter(product => {
            return product.name === 'Accounting'
                || product.name === 'Sales'
                || product.name === 'Payroll'
                || product.name === 'Timetracking';
        });

        const moduleRoleGroups: IRoleGroup[] = products.map(product => {
            const isPurchased = this.elsaPurchases.some(purchase => {
                return purchase.ProductID === product.id
                    && purchase.GlobalIdentity === this.user.GlobalIdentity;
            });

            return {
                label: product.label,
                roles: [],
                product: product,
                productPurchased: isPurchased
            };
        });

        const othersGroup = {
            label: 'Diverse',
            roles: []
        };

        roles.forEach(role => {
            const productName = role.Name.split('.')[0];
            const group = moduleRoleGroups.find(grp => grp.product.name === productName);

            if (group) {
                group.roles.push(role);
            } else {
                othersGroup.roles.push(role);
            }
        });

        return [...moduleRoleGroups, othersGroup];
    }
}
