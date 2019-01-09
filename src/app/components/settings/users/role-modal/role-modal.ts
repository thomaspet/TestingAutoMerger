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
import {UniModalService, MissingPurchasePermissionModal} from '@uni-framework/uni-modal';

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

    user: User;
    elsaProducts: any[];
    elsaPurchases: ElsaPurchase[];

    roleGroups: IRoleGroup[];
    busy: boolean;
    hasPurchasedProduct: boolean;

    constructor(
        private modalService: UniModalService,
        private errorService: ErrorService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private elsaProductService: ElsaProductService,
        private elsaPurchaseService: ElsaPurchaseService
    ) {}

    public ngOnInit() {
        this.user = this.options.data.user;

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

    purchaseProduct(group: IRoleGroup) {
        if (group.product) {
            this.busy = true;

            this.elsaPurchaseService.massUpdate([{
                ID: null,
                ProductID: group.product.id,
                GlobalIdentity: this.user.GlobalIdentity
            }]).subscribe(
                () => {
                    this.hasPurchasedProduct = true;
                    group.productPurchased = true;
                    if (!group.roles.some(role => role['_checked'])) {
                        let roleToActivate;

                        try {
                            const defaultRoleName = group.product.listOfRoles.split(',')[0]
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
                },
                err => this.errorService.handle(err),
                () => this.busy = false
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

    saveRoles() {
        // Loop roles and figure out what changed (new roles added, existing roles removed)
        const addRoles: Partial<UserRole>[] = [];
        const removeRoles: Partial<UserRole>[] = [];

        this.roleGroups.forEach(group => {
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
            this.onClose.emit(this.hasPurchasedProduct);
        }
    }

    private groupRolesByProducts(roles: Role[], products: ElsaProduct[]): IRoleGroup[] {
        // Create groups based on products (of type Module)
        const filteredProducts = (products || []).filter(product => {
            return product.productTypeName === 'Module'
                && product.name !== 'Complete';
        });

        // This can be removed when Complete is gone as a product in prod
        const completeProduct = products.find(product => product.name === 'Complete');
        const userHasComplete = !!completeProduct && this.elsaPurchases.some(purchase => {
            return purchase.GlobalIdentity === this.user.GlobalIdentity
                && purchase.ProductID === completeProduct.id;
        });
        // end of removable block

        const groups: IRoleGroup[] = filteredProducts.map(product => {
            let isPurchased = this.elsaPurchases.some(purchase => {
                return purchase.ProductID === product.id
                    && purchase.GlobalIdentity === this.user.GlobalIdentity;
            });

            // This can be removed when Complete is gone as a product in prod
            if (!isPurchased) {
                isPurchased = userHasComplete && (
                    product.name === 'Accounting'
                    || product.name === 'Sales'
                    || product.name === 'Payroll'
                    || product.name === 'Timetracking'
                );
            }
            // end of removable block

            // Allow assigning roles to unregistrered users (invited)
            // so they dont get full access to the system by default
            const userStatusInvited = this.user.StatusCode === 110000;

            return {
                label: product.label,
                roles: [],
                product: product,
                productPurchased: isPurchased || userStatusInvited
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
                const listOfRoles = group.product && group.product.listOfRoles;
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
                otherGroup.roles.push(role);
            }
        });

        groups.push(otherGroup);
        return groups.filter(group => group.roles && group.roles.length);
    }
}
