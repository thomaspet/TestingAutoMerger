import {Component, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {Observable, forkJoin, of as observableOf} from 'rxjs';
import {map, catchError, finalize} from 'rxjs/operators';
import {User, Role, UserRole} from '@uni-entities';
import {
    ErrorService,
    RoleService,
    UserRoleService,
    ElsaProductService,
    ElsaPurchaseService,
} from '@app/services/services';
import {ElsaPurchase, ElsaProduct, ElsaProductType} from '@app/models';

interface IRoleGroup {
    label: string;
    roles: Role[];
    product?: ElsaProduct;
    productPurchased?: boolean;
    purchase?: ElsaPurchase;
    canToggleProduct?: boolean;
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

    user: User;
    elsaProducts: any[];
    elsaPurchases: ElsaPurchase[];

    roleGroups: IRoleGroup[];
    busy: boolean;
    hasPurchasedProduct: boolean;
    userStatusInvited: boolean;

    constructor(
        private errorService: ErrorService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {}

    public ngOnInit() {
        this.user = this.options.data.user;
        this.userStatusInvited = this.user.StatusCode === 110000;

        this.busy = true;
        forkJoin([
            this.elsaProductService.getProductsOnContractType(),
            this.elsaPurchaseService.getAll()
        ]).pipe(
            finalize(() => this.busy = false)
        ).subscribe(
            res => {
                this.elsaProducts = res[0];
                this.elsaPurchases = res[1];
                this.getGroupedRoles().subscribe(groups => this.roleGroups = groups);
            },
            err => this.errorService.handle(err),
        );
    }

    private getGroupedRoles(): Observable<IRoleGroup[]> {
        return forkJoin([
            this.roleService.GetAll('orderby=Label'),
            this.userRoleService.getRolesByUserID(this.user.ID)
        ]).pipe(
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

                return this.groupRolesByProducts(roles, this.elsaProducts);
            }),
            catchError(err => {
                this.errorService.handle(err);
                return observableOf([]);
            })
        );
    }

    onRoleClick(group: IRoleGroup, role: Role) {
        if (!group.product || group.productPurchased) {
            role['_checked'] = !role['_checked'];
        }
    }

    togglePurchase(group: IRoleGroup, event: MouseEvent) {
        event.stopPropagation();
        group.productPurchased = !group.productPurchased;

        if (group.productPurchased && !group.roles.some(role => role['_checked'])) {
            this.checkDefaultRoles(group);
        }
    }

    private checkDefaultRoles(group: IRoleGroup) {
        // Check if product has DefaultRoles defined first
        if (group.product.DefaultRoles) {
            const defaultRoles = group.product.DefaultRoles.toLowerCase();
            let didCheckRole = false;

            group.roles.forEach(role => {
                if (role.Name && defaultRoles.includes(role.Name.toLowerCase())) {
                    role['_checked'] = true;
                    didCheckRole = true;
                }
            });

            if (didCheckRole) {
                return;
            }
        }

        // If not, check if product has ListOfRoles and check the first one
        if (group.product.ListOfRoles) {
            const firstRoleName = group.product.ListOfRoles.split(',')[0];
            const roleIndex = group.roles.findIndex(r => (r.Name || '').toLowerCase() === firstRoleName);
            if (roleIndex >= 0) {
                group.roles[roleIndex]['_checked'] = true;
                return;
            }
        }

        // If not, just select the first role in the role array
        if (group.roles[0]) {
            group.roles[0]['_checked'] = true;
        }
    }

    saveRoles() {
        // Loop rolegroups and figure out what changed (roles/purchases)
        const addRoles: Partial<UserRole>[] = [];
        const removeRoles: Partial<UserRole>[] = [];
        const purchaseChanges = [];

        this.roleGroups.forEach(group => {
            const hasActiveRole = group.roles.some(role => role['_checked']);

            // Avoid updating purchases for users with status "invited" (missing GlobalIdentity)
            if (!this.userStatusInvited) {
                if (group.purchase) {
                    // Remove purchase if all roles are removed, or the user toggled it off themselves
                    if (group.canToggleProduct && (!group.productPurchased || !hasActiveRole)) {
                        group.purchase.Deleted = true;
                        purchaseChanges.push(group.purchase);
                    }
                } else {
                    // Add purchase if the user activated it and at least one role is activated
                    if (group.productPurchased && hasActiveRole) {
                        purchaseChanges.push({
                            ID: null,
                            ProductID: group.product.ID,
                            GlobalIdentity: this.user.GlobalIdentity
                        });
                    }
                }
            }

            // Find changes to roles
            if (!group.product || group.productPurchased) {
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
            // If purchase is removed, remove all userroles
            } else {
                group.roles.forEach(role => {
                    if (role['_userRole']) {
                        const existsInDifferentProduct = this.roleGroups.some(roleGroup => {
                            return roleGroup.product
                                && roleGroup.product.ID !== group.product.ID
                                && roleGroup.roles.some(r => r.ID === role.ID && r['_checked']);
                        });

                        if (!existsInDifferentProduct) {
                            removeRoles.push(role['_userRole']);
                        }
                    }
                });
            }
        });

        const updateRequests = [];
        if (purchaseChanges.length) {
            updateRequests.push(this.elsaPurchaseService.massUpdate(purchaseChanges));
        }

        if (addRoles.length || removeRoles.length) {
            updateRequests.push(this.userRoleService.bulkUpdate(addRoles, removeRoles));
        }

        if (updateRequests.length) {
            this.busy = true;
            forkJoin(updateRequests).subscribe(
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
            this.onClose.emit();
        }
    }

    private groupRolesByProducts(roles: Role[], products: ElsaProduct[]): IRoleGroup[] {
        // Create groups based on products
        const filteredProducts = (products || []).filter(product => {
            return product.ProductType === ElsaProductType.Module
                || product.ProductType === ElsaProductType.Package;
        });

        const groups: IRoleGroup[] = filteredProducts.map(product => {
            const purchase = this.elsaPurchases.find(p => {
                return p.ProductID === product.ID
                    && p.GlobalIdentity === this.user.GlobalIdentity;
            });

            return {
                label: product.Label,
                roles: [],
                product: product,
                canToggleProduct: product.ProductType !== ElsaProductType.Package,
                // Purchases will be added to invited users once they finish the registration.
                // Mark all products as purchased until that, so its possible to tweak roles.
                productPurchased: !!purchase || this.userStatusInvited,
                purchase: purchase
            };
        });

        // Add a group for roles that are not connected to a product
        const otherGroup = {
            label: 'Annet',
            roles: []
        };

        roles = roles.filter(role => role.Label !== 'Webhook.Admin');

        // Fill the groups with roles
        roles.forEach(role => {
            const roleNameLowerCase = (role.Name || '').toLowerCase();
            const groupsThatShouldHaveRole = groups.filter(group => {
                const listOfRoles = group.product && group.product.ListOfRoles;
                if (listOfRoles) {
                    return listOfRoles.split(',').some(roleName => {
                        return roleName && roleName.toLowerCase() === roleNameLowerCase;
                    });
                }
            });

            if (groupsThatShouldHaveRole.length) {
                groupsThatShouldHaveRole.forEach(group => {
                    group.roles.push(role);
                });
            } else if (role.Name === 'Administrator') {
                otherGroup.roles.push(role);
            }
        });

        groups.push(otherGroup);
        return groups.filter(group => group.roles?.length);
    }
}
