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
import {ElsaPurchase, ElsaProduct} from '@app/models';

interface IRoleGroup {
    label: string;
    roles: Role[];
    product?: ElsaProduct;
    productPurchased?: boolean;
    purchase?: ElsaPurchase;
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
        forkJoin(
            this.elsaProductService.GetAll(),
            this.elsaPurchaseService.getAll()
        ).pipe(
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
            let roleToActivate;
            try {
                const defaultRoleName = group.product.ListOfRoles.split(',')[0]
                    .trim()
                    .toLowerCase();

                roleToActivate = defaultRoleName && group.roles.find(role => {
                    return (role.Name || '').toLowerCase() === defaultRoleName;
                });
            } catch (e) {}

            roleToActivate = roleToActivate || group.roles[0];

            if (roleToActivate) {
                roleToActivate['_checked'] = true;
            }
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
                    if (!group.productPurchased || !hasActiveRole) {
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
            } else if (hasActiveRole) {
                group.roles.forEach(role => {
                    const existsInDifferentProduct = this.roleGroups.some(g => {
                        return g.product
                            && g.product.ID !== group.product.ID
                            && g.roles.some(r => r.ID === role.ID && r['_checked']);
                    });

                    if (role['_userRole'] && !existsInDifferentProduct) {
                        removeRoles.push(role['_userRole']);
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
        // Create groups based on products (of type Module)
        const filteredProducts = (products || []).filter(product => {
            return product.ProductTypeName === 'Module'
                && product.Name !== 'Complete';
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
            } else {
                // Bank roles should not be available here. They're set automatically.
                if (role.Name && !role.Name.includes('Bank')) {
                    otherGroup.roles.push(role);
                }
            }
        });

        groups.push(otherGroup);
        return groups.filter(group => group.roles && group.roles.length);
    }
}
