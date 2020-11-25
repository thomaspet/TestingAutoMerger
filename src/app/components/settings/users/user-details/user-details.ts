import {Component, Input, Output, EventEmitter} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';

import {User, Role, UserRole} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniRoleModal} from '../role-modal/role-modal';
import {AuthService} from '@app/authService';
import {ActivateAutobankModal} from '../activate-autobank-modal/activate-autobank-modal';
import {ResetAutobankPasswordModal} from '../reset-autobank-password-modal/reset-autobank-password-modal';
import {ElsaProduct, ElsaPurchase, ElsaProductType} from '@app/models';
import {
    RoleService,
    UserRoleService,
    ElsaPurchaseService,
    ElsaProductService,
} from '@app/services/services';
import { theme, THEMES } from 'src/themes/theme';

interface UserRoleGroup {
    label: string;
    userRoles: UserRole[];
    product?: ElsaProduct;
    productPurchased?: boolean;
}

enum UserStatus {
    Invited = 110000,
    Active = 110001,
    InActive = 110002,
}

@Component({
    selector: 'user-details',
    templateUrl: './user-details.html',
    styleUrls: ['./user-details.sass'],
})
export class UserDetails {
    @Input() user: User;
    @Input() users: User[];
    @Input() currentUserIsAdmin: boolean;

    @Output() activateUser: EventEmitter<any> = new EventEmitter();
    @Output() deactivateUser: EventEmitter<any> = new EventEmitter();
    @Output() reloadUsers: EventEmitter<any> = new EventEmitter();
    @Output() resendInvite: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancelInvite: EventEmitter<string> = new EventEmitter<string>();

    busy: boolean;
    scrollbar: PerfectScrollbar;
    roles: Role[];
    userRoles: UserRole[];
    userRoleGroups: UserRoleGroup[];
    userStatusInvited: boolean;

    roleGroups: {label: string, roles: UserRole[]}[];
    products: ElsaProduct[];
    purchases: ElsaPurchase[];

    companyHasAutobank: boolean;
    userActions: {label: string, action: () => void}[];

    loadSubscription: Subscription;

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

    ngOnDestroy() {
        if (this.loadSubscription) {
            this.loadSubscription.unsubscribe();
        }
    }

    ngOnChanges() {
        if (this.user && this.users) {
            this.userStatusInvited = this.user.StatusCode === UserStatus.Invited;

            if (this.loadSubscription) {
                this.loadSubscription.unsubscribe();
            }

            this.loadSubscription = this.loadData();
        }
    }

    openRoleModal() {
        this.modalService.open(UniRoleModal, {
            data: { user: this.user }
        }).onClose.subscribe(rolesChanged => {
            if (rolesChanged) {
                this.loadSubscription = this.loadData();
            }
        });
    }

    private initUserActions() {
        const actions = [];

        // Invited user
        if (this.user.StatusCode === UserStatus.Invited) {
            actions.push(
                {
                    label: 'Send ny invitasjon',
                    action: () => this.resendInvite.emit(this.user.Email),
                },
                {
                    label: 'Avbryt invitasjon',
                    action: () => this.cancelInvite.emit(this.user.Email),
                },
            );
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
                const authenticatedUser = this.authService.currentUser;
                if (authenticatedUser && authenticatedUser.IsAutobankAdmin) {
                    if (this.user.BankIntegrationUserName) {
                        actions.push({
                            label: 'Tilbakestill autobank passord',
                            action: (user: User) => {
                                this.modalService.open(ResetAutobankPasswordModal, {data: this.user});
                            }
                        });
                    } else {
                        actions.push({
                            label: 'Registrer som bankbruker',
                            action: () => this.registerBankUser()
                        });
                    }
                }
            }

            actions.push({
                label: 'Deaktiver bruker',
                action: () => this.deactivateUser.emit()
            });
        }

        this.userActions = actions;
    }

    private loadData(): Subscription {
        this.busy = true;

        return forkJoin(
            this.roleService.GetAll(),
            this.userRoleService.getRolesByUserID(this.user.ID),
            this.productService.getProductsOnContractType(),
            this.purchaseService.getAll(),
            this.elsaPurchaseService.getPurchaseByProductName('Autobank')
        ).subscribe(
            res => {
                this.roles = res[0] || [];
                this.userRoles = this.setAssignmentMetadata(res[1] || []);
                this.products = res[2];
                this.purchases = res[3];
                this.companyHasAutobank = !!res[4] || theme.theme === THEMES.SR;

                this.userRoleGroups = this.getGroupedUserRoles(this.userRoles);
                this.initUserActions();
                this.busy = false;
            },
            err => {
                console.error(err);
                this.busy = false;
            }
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
            return product.ProductType === ElsaProductType.Module || product.ProductType === ElsaProductType.Package;
        });

        // This can be removed when Complete is gone as a product in prod
        const completeProduct = this.products.find(product => product.Name === 'Complete');
        const userHasComplete = !!completeProduct && this.purchases.some(purchase => {
            return purchase.GlobalIdentity === this.user.GlobalIdentity
                && purchase.ProductID === completeProduct.ID;
        });
        // end of removable block

        const groups: UserRoleGroup[] = filteredProducts.map(product => {
            let isPurchased = this.purchases.some(purchase => {
                return purchase.ProductID === product.ID
                    && purchase.GlobalIdentity === this.user.GlobalIdentity;
            });

            // This can be removed when Complete is gone as a product in prod
            if (!isPurchased) {
                isPurchased = userHasComplete && (
                    product.Name === 'Accounting'
                    || product.Name === 'Sales'
                    || product.Name === 'Payroll'
                    || product.Name === 'Timetracking'
                );
            }
            // end of removable block

            return {
                label: product.Label,
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
                const listOfRoles = group.product && group.product.ListOfRoles;
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
            return (!group.product || group.productPurchased || this.userStatusInvited)
                && group.userRoles
                && group.userRoles.length;
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
