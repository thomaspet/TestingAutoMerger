import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {User, UserRole} from '@uni-entities';
import {InviteUsersModal} from './invite-users-modal/invite-users-modal';
import {UniModalService, ProductPurchasesModal} from '@uni-framework/uni-modal';
import {
    ErrorService,
    UserService,
    UserRoleService,
    ElsaContractService,
} from '@app/services/services';

import PerfectScrollbar from 'perfect-scrollbar';
import {AuthService} from '@app/authService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {UniRoleModal} from './role-modal/role-modal';
import {ElsaSupportUserDTO} from '@app/models';

@Component({
    selector: 'user-management',
    templateUrl: './users.html',
    styleUrls: ['./users.sass'],
})
export class UserManagement {
    scrollbar: PerfectScrollbar;
    searchControl: FormControl = new FormControl('');

    users: User[] = [];
    filteredUsers: User[] = [];
    selectedUser: User;

    isAdmin: boolean;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private errorService: ErrorService,
        private userService: UserService,
        private userRoleService: UserRoleService,
        private uniHttp: UniHttp,
        private toastService: ToastService,
        private tabService: TabService,
        private elsaContractService: ElsaContractService,
    ) {
        this.tabService.addTab({
            name: 'Brukere',
            url: '/settings/users',
            moduleID: UniModules.SubSettings,
            active: true
       });
        this.userRoleService.hasAdminRole(this.authService.currentUser.ID)
            .subscribe(isAdmin => this.isAdmin = isAdmin);

        this.loadUsers();
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => this.filterUsers(query));
    }

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#user-list');
    }

    onUserSelected(user: User) {
        this.selectedUser = user;
    }

    private filterUsers(query: string) {
        if (query && query.length) {
            this.filteredUsers = this.users.filter(user => {
                const displayName = user.DisplayName
                    ? user.DisplayName.toLowerCase()
                    : '';

                return displayName.includes(query.toLowerCase());
            });
        } else {
            this.filteredUsers = this.users;
        }

        setTimeout(() => {
            if (this.scrollbar) {
                this.scrollbar.update();
            }
        });
    }

    loadUsers(invalidateCache?: boolean) {
        if (invalidateCache) {
            this.userService.invalidateCache();
            this.userRoleService.invalidateCache();
        }

        forkJoin([
            this.userService.GetAll(),
            this.userRoleService.GetAll(),
            this.elsaContractService.getSupportUsers()
        ]).subscribe(
            res => {
                this.users = this.setStatusMetadata(res[0], res[1], res[2]);
                this.filteredUsers = this.users;

                const selectedIndex = this.selectedUser && this.users.findIndex(u => u.ID === this.selectedUser.ID);
                if (selectedIndex >= 0) {
                    this.selectedUser = this.users[selectedIndex];
                } else {
                    this.selectedUser = this.users[0];
                }
            },
            err => this.errorService.handle(err)
        );
    }

    private setStatusMetadata(users: User[], userRoles: UserRole[], supportUsers: ElsaSupportUserDTO[]): User[] {
        if (!users || !users.length) {
            return [];
        }

        return users.filter(user => !user.Protected).map(user => {
            switch (user.StatusCode) {
                case 110000:
                    user['_statusText'] = 'Invitert';
                    user['_statusClass'] = 'invited';
                    user['_statusIcon'] = 'add_circle';
                break;
                case 110001:
                    user['_isActive'] = true;
                    user['_statusText'] = 'Aktiv bruker';
                    user['_statusClass'] = 'active';
                    user['_statusIcon'] = 'check_circle';

                    const isAdmin = userRoles.some(role => {
                        return role.UserID === user.ID
                            && role.SharedRoleName === 'Administrator';
                    });

                    user['_isAdmin'] = isAdmin;
                    if (supportUsers.some(su => su.Email === user.Email)) {
                        user['_isSupport'] = true;
                        user['_supportType'] = this.translateSupportType(supportUsers.find(su => su.Email === user.Email).SupportType);
                    }
                break;
                case 110002:
                    user['_statusText'] = 'Deaktivert';
                    user['_statusClass'] = 'inactive';
                    user['_statusIcon'] = 'remove_circle';
                break;
            }

            return user;
        });
    }

    translateSupportType(supportType: number): string {
        return supportType === 0 ? 'Support' : 'Regnskapsfører';
    }

    manageProductPurchases() {
        this.modalService.open(ProductPurchasesModal, {
            data: {
                users: this.users,
            }
        }).onClose.subscribe(changesMade => {
            if (changesMade) {
                this.loadUsers();
            }
        });
    }

    openInviteUserModal() {
        this.modalService.open(InviteUsersModal).onClose.subscribe((user: User) => {
            if (user) {
                this.selectedUser = user;
                this.loadUsers();
                this.openRoleModal();
            }
        });
    }

    openRoleModal() {
        this.modalService.open(UniRoleModal, {
            data: { user: this.selectedUser }
        }).onClose.subscribe(rolesChanged => {
            if (rolesChanged) {
                this.loadUsers();
            }
        });
    }

    activateUser() {
        this.userService.PostAction(this.selectedUser.ID, 'activate').subscribe(
            () => this.loadUsers(),
            err => this.errorService.handle(err)
        );
    }

    deactivateUser() {
        this.userService.PostAction(this.selectedUser.ID, 'inactivate').subscribe(
            () => this.loadUsers(),
            err => this.errorService.handle(err)
        );
    }

    resendInvite(email: string) {
        this.uniHttp.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications')
            .withBody({
                Email: email,
                CompanyId: this.authService.activeCompany.ID,
            })
            .send()
            .subscribe(
                () => this.toastService.addToast(
                    'Invitasjon sendt',
                    ToastType.good,
                    ToastTime.short,
                    `Sendte en mail med invitasjonslink til ${email}`
                ),
                err => this.errorService.handle(err),
            );
    }

    cancelInvite(email: string) {
        this.uniHttp.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications?action=cancel-invitation')
            .withBody({
                Email: email,
                CompanyId: this.authService.activeCompany.ID,
            })
            .send()
            .subscribe(
                () => {
                    this.toastService.addToast(
                        'Invitasjon avbrutt',
                        ToastType.good,
                        ToastTime.short,
                        `Invitasjonen til ${email} er kansellert`);
                    this.loadUsers(true);
                },
                err => this.errorService.handle(err),
            );
    }
}
