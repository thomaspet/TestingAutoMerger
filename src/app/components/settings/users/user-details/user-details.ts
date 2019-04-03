import {Component, Input, Output, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';

import {User, Role, UserRole} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniRoleModal} from '../role-modal/role-modal';
import {AuthService} from '@app/authService';
import {ActivateAutobankModal} from '../activate-autobank-modal/activate-autobank-modal';
import {ResetAutobankPasswordModal} from '../reset-autobank-password-modal/reset-autobank-password-modal';
import {ElsaProduct, ElsaPurchase} from '@app/models';
import {
    RoleService,
    UserRoleService,
    ElsaPurchaseService,
    ElsaProductService,
} from '@app/services/services';

interface UserRoleGroup {
    label: string;
    userRoles: UserRole[];
    product?: ElsaProduct;
    productPurchased?: boolean;
}

enum UserStatus {
    Draft = 110000,
    Active = 110001,
    InActive = 110002,
}

@Component({
    selector: 'user-details',
    templateUrl: './user-details.html',
    styleUrls: ['./user-details.sass'],
    host: {'class': 'uni-redesign'}
})
export class UserDetails {
    @Input() user: User;
    @Input() users: User[];

    @Output() activateUser: EventEmitter<any> = new EventEmitter();
    @Output() deactivateUser: EventEmitter<any> = new EventEmitter();
    @Output() reloadUsers: EventEmitter<any> = new EventEmitter();
    @Output() resendInvite: EventEmitter<User> = new EventEmitter<User>();

    scrollbar: PerfectScrollbar;
    roles: Role[];
    userRoles: UserRole[];
    userRoleGroups: UserRoleGroup[];

    roleGroups: {label: string, roles: UserRole[]}[];
    products: ElsaProduct[];
    purchases: ElsaPurchase[];

    companyHasAutobank: boolean;
    userActions: {label: string, action: () => void}[];

    constructor(
        private authService: AuthService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private modalService: UniModalService,
        private elsaPurchaseService: ElsaPurchaseService,
        private productService: ElsaProductService,
        private purchaseService: ElsaPurchaseService
    ) {}

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#role-info');
    }

    ngOnChanges() {
        if (this.user && this.users) {
            this.loadRoles();

            this.elsaPurchaseService.getPurchaseByProductName('Autobank')
                .finally(() => this.initUserActions())
                .subscribe(
                    res => this.companyHasAutobank = !!res,
                    err => console.error(err)
                );
        }
    }

    openRoleModal() {
        this.modalService.open(UniRoleModal, {
            data: { user: this.user }
        }).onClose.subscribe(rolesChanged => {
            if (rolesChanged) {
                this.loadRoles();
            }
        });
    }

    private initUserActions() {
        const actions = [];

        // Invited user
        if (this.user.StatusCode === UserStatus.Draft) {
            actions.push({
                label: 'Send ny invitasjon',
                action: () => this.resendInvite.emit(this.user),
            });
        }

        // Deactivated user
        if (this.user.StatusCode === UserStatus.InActive) {
            actions.push({
                label: 'Aktiver bruker',
                action: () => this.activateUser.emit()
            });
        }

        if (this.user.StatusCode === UserStatus.Active) {
            if (this.companyHasAutobank) {
                if (this.user.BankIntegrationUserName) {
                    const authenticatedUser = this.authService.currentUser;
                    if (authenticatedUser && authenticatedUser.IsAutobankAdmin) {
                        actions.push({
                            label: 'Tilbakestill autobank passord',
                            action: (user: User) => {
                                this.modalService.open(ResetAutobankPasswordModal, {data: this.user});
                            }
                        });
                    }
                } else {
                    actions.push({
                        label: 'Registrer som bankbruker',
                        action: () => this.registerBankUser()
                    });
                }
            }

            actions.push({
                label: 'Deaktiver bruker',
                action: () => this.deactivateUser.emit()
            });
        }

        this.userActions = actions;
    }

    private loadRoles() {
        forkJoin(
            this.roleService.GetAll(),
            this.userRoleService.getRolesByUserID(this.user.ID),
            this.productService.GetAll(),
            this.purchaseService.getAll()
        ).subscribe(
            res => {
                this.roles = res[0] || [];
                this.userRoles = this.setAssignmentMetadata(res[1] || []);
                this.products = res[2];
                this.purchases = res[3];

                this.userRoleGroups = this.getGroupedUserRoles(this.userRoles);
            },
            err => console.error(err)
        );
    }

    private setAssignmentMetadata(roles: UserRole[]): UserRole[] {
        return roles.map(role => {
            const assignedBy = this.users.find(user => user.GlobalIdentity === role.CreatedBy);
            role['_assignedDate'] = moment(role.CreatedAt).format('DD.MM.YYYY');
            role['_assignedBy'] = assignedBy && assignedBy.DisplayName;

            return role;
        });
    }

    private getGroupedUserRoles(userRoles: UserRole[]): UserRoleGroup[] {
        if (!userRoles || !userRoles.length) {
            return [];
        }

        const filteredProducts = this.products.filter(product => {
            return product.productTypeName === 'Module' && product.name !== 'Complete';
        });

        // This can be removed when Complete is gone as a product in prod
        const completeProduct = this.products.find(product => product.name === 'Complete');
        const userHasComplete = !!completeProduct && this.purchases.some(purchase => {
            return purchase.GlobalIdentity === this.user.GlobalIdentity
                && purchase.ProductID === completeProduct.id;
        });
        // end of removable block

        const groups: UserRoleGroup[] = filteredProducts.map(product => {
            let isPurchased = this.purchases.some(purchase => {
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

            return {
                label: product.label,
                userRoles: [],
                product: product,
                productPurchased: isPurchased
            };
        });

        // Add a group for roles that are not connected to a product
        const otherGroup = {
            label: 'Annet',
            userRoles: []
        };

        // Fill the groups with userRoles
        userRoles.forEach(userRole => {
            const roleNameLowerCase = (userRole.SharedRoleName || '').toLowerCase();
            const groupsThatShouldHaveUserRole = groups.filter(group => {
                const listOfRoles = group.product && group.product.listOfRoles;
                if (listOfRoles) {
                    return listOfRoles.split(',').some(roleName => {
                        return roleName && roleName.toLowerCase() === roleNameLowerCase;
                    });
                }
            });

            if (groupsThatShouldHaveUserRole.length) {
                groupsThatShouldHaveUserRole.forEach(group => group.userRoles.push(userRole));
            } else {
                otherGroup.userRoles.push(userRole);
            }
        });

        groups.push(otherGroup);
        return groups.filter(group => {
            return (!group.product || group.productPurchased) && group.userRoles && group.userRoles.length;
        });
    }

    private registerBankUser() {
        this.modalService.open(ActivateAutobankModal, {
            data: this.user
        }).onClose.subscribe(activated => {
            if (activated) {
                this.reloadUsers.emit();
            }
        });
    }
}
