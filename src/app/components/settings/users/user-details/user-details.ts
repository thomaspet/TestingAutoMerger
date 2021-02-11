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
    BankService,
} from '@app/services/services';
import { theme, THEMES } from 'src/themes/theme';
import { BankAgreementServiceProvider } from '@app/models/autobank-models';

interface PurchasedProductGroup {
    label: string;
    userRoles: UserRole[];
    product?: ElsaProduct;
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
    purchasedProductGroups: PurchasedProductGroup[];
    userStatusInvited: boolean;
    serviceProvider: BankAgreementServiceProvider;

    roleGroups: {label: string, roles: UserRole[]}[];
    purchases: ElsaPurchase[];
    products: ElsaProduct[];

    companyHasAutobank: boolean;
    userActions: {label: string, action: () => void}[];

    loadSubscription: Subscription;

    constructor(
        private authService: AuthService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private modalService: UniModalService,
        private productService: ElsaProductService,
        private purchaseService: ElsaPurchaseService,
        private bankService: BankService,
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
            if (this.companyHasAutobank && this.authService.currentUser?.IsAutobankAdmin) {
                if (this.user.BankIntegrationUserName && this.serviceProvider !== BankAgreementServiceProvider.ZdataV3) {
                    actions.push({
                        label: 'Tilbakestill autobank passord',
                        action: (user: User) => {
                            this.modalService.open(ResetAutobankPasswordModal, {data: this.user});
                        }
                    });
                } else if (!this.user.BankIntegrationUserName) {
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

    loadProducts() {
        const currentContractType = this.authService.currentUser.License.ContractType.TypeID;
        const filter = `isperuser eq true and (producttype eq 'Module' or producttype eq 'Package')`;
        const select = 'id,label,listofroles'

        this.productService.getProductsOnContractTypes(currentContractType, filter, select).subscribe(
            products => this.products = products, 
            err => console.error(err)
        );
    }

    private loadData(): Subscription {
        this.busy = true;

        if (!this.products?.length) {
            this.loadProducts();
        }

        return forkJoin([
            this.roleService.GetAll(),
            this.userRoleService.getRolesByUserID(this.user.ID),
            this.purchaseService.getAll(),
            this.purchaseService.getPurchaseByProductName('Autobank'),
            this.bankService.getDefaultServiceProvider()
        ]).subscribe(
            res => {
                this.roles = res[0] || [];
                this.userRoles = this.setAssignmentMetadata(res[1] || []);
                this.purchases = res[2];
                this.companyHasAutobank = !!res[3] || theme.theme === THEMES.SR;
                this.serviceProvider = res[4];

                this.purchasedProductGroups = this.getGroupedUserRoles(this.userRoles);
                
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
            role['_assignedBy'] = assignedBy?.DisplayName || assignedBy?.Email;

            return role;
        });
    }

    private getGroupedUserRoles(userRoles: UserRole[]): PurchasedProductGroup[] {

        const userPurchases = this.purchases.filter(purchase => purchase.GlobalIdentity === this.user.GlobalIdentity);

        const groups: PurchasedProductGroup[] = [];
        
        if (userPurchases?.length) {
            userPurchases.forEach(purchase => {
                const product = this.products.find(product => product.ID === purchase.ProductID);
                if (product) {
                    groups.push({
                        label: product.Label,
                        userRoles: [],
                        product: product
                    });
                }
            });
        }

        // Add a group for roles that are not connected to a product
        const otherGroup = {
            label: 'Annet',
            userRoles: []
        };

        // Fill the groups with userRoles
        if (userRoles?.length) {
            userRoles.forEach(userRole => {
                const roleNameLowerCase = (userRole.SharedRoleName || '').toLowerCase();

                const groupsThatShouldHaveUserRole = groups.filter(group => {
                    const listOfRoles = group?.product?.ListOfRoles || '';
                    return listOfRoles.split(',').some(roleName => {
                        return roleName?.toLowerCase() === roleNameLowerCase;
                    });
                });

                if (groupsThatShouldHaveUserRole?.length) {
                    groupsThatShouldHaveUserRole.forEach(group => group.userRoles.push(userRole));
                } else {
                    otherGroup.userRoles.push(userRole);
                }
            });
        }

        if (otherGroup.userRoles?.length) {
            groups.push(otherGroup);
        }

        return groups;
    }

    private registerBankUser() {
        this.modalService.open(ActivateAutobankModal, {
            data: { user: this.user, serviceProvider: this.serviceProvider }
        }).onClose.subscribe(activated => {
            if (activated) {
                this.reloadUsers.emit();
            }
        });
    }
}
