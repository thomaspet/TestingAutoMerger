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
} from '@app/services/services';

import PerfectScrollbar from 'perfect-scrollbar';
import {AuthService} from '@app/authService';
import {UniHttp} from '@uni-framework/core/http/http';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

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
    ) {
        this.tabService.addTab({
            name: 'Brukere',
            url: '/settings/users',
            moduleID: UniModules.Settings,
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

                return displayName.startsWith(query.toLowerCase());
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

        forkJoin(
            this.userService.GetAll(),
            this.userRoleService.GetAll()
        ).subscribe(
            res => {
                this.users = this.setStatusMetadata(res[0], res[1]);
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

    private setStatusMetadata(users: User[], userRoles: UserRole[]): User[] {
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
        this.modalService.open(InviteUsersModal).onClose.subscribe(userInvited => {
            if (userInvited) {
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

    resendInvite(user: User) {
        this.uniHttp.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications')
            .withBody({
                Email: user.Email,
                CompanyId: this.authService.activeCompany.ID,
            })
            .send()
            .subscribe(
                () => this.toastService.addToast(
                    'Invitasjon sent',
                    ToastType.good,
                    ToastTime.short,
                    `Sente en mail til ${user.Email} med en invitasjons link`
                ),
                err => this.errorService.handle(err),
            );
    }
}
