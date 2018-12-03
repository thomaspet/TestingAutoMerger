import {Component, Input, Output, EventEmitter} from '@angular/core';
import {forkJoin} from 'rxjs';
import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';

import {User, Role, UserRole} from '@uni-entities';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniRoleModal} from '../role-modal/role-modal';
import {
    RoleService,
    UserRoleService,
    ElsaPurchaseService,
} from '@app/services/services';
import {AuthService} from '@app/authService';
import {ActivateAutobankModal} from '../activate-autobank-modal/activate-autobank-modal';
import {ResetAutobankPasswordModal} from '../reset-autobank-password-modal/reset-autobank-password-modal';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

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

    scrollbar: PerfectScrollbar;
    roles: Role[];
    userRoles: UserRole[];
    roleGroups: {label: string, roles: UserRole[]}[];

    companyHasAutobank: boolean;
    userActions: {label: string, action: () => void}[];

    constructor(
        private authService: AuthService,
        private roleService: RoleService,
        private userRoleService: UserRoleService,
        private modalService: UniModalService,
        private elsaPurchaseService: ElsaPurchaseService,
        private toastService: ToastService,
    ) {}

    ngAfterViewInit() {
        this.scrollbar = new PerfectScrollbar('#role-info');
    }

    ngOnChanges() {
        if (this.user && this.users) {
            this.loadRoles();

            this.elsaPurchaseService.getPurchaseByProductName('Autobank').subscribe(
                res => {
                    this.companyHasAutobank = !!res;
                    this.initUserActions();
                },
                err => console.error(err)
            );
        }
    }

    openRoleModal() {
        this.modalService.open(UniRoleModal, {
            data: {
                user: this.user
            }
        }).onClose.subscribe((rolesChanged) => {
            if (rolesChanged) {
                this.loadRoles();
            }
        });
    }

    private initUserActions() {
        const actions = [];

        // Deactivated user
        if (this.user.StatusCode === 110002) {
            actions.push({
                label: 'Aktiver bruker',
                action: () => this.activateUser.emit()
            });
        }

        // Active user
        if (this.user.StatusCode === 110001) {
            if (this.companyHasAutobank) {
                if (this.user.BankIntegrationUserName) {
                    const authenticatedUser = this.authService.currentUser;
                    if (authenticatedUser && authenticatedUser.IsAutobankAdmin) {
                        actions.push({
                            label: 'Tilbakestill autobank passord',
                            action: (user: User) => {
                                this.modalService.open(ResetAutobankPasswordModal, {data: user});
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
            this.userRoleService.getRolesByUserID(this.user.ID)
        ).subscribe(
            res => {
                this.roles = res[0] || [];
                this.userRoles = this.setAssignmentMetadata(res[1] || []);

                this.groupRoles(this.userRoles);
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

    private groupRoles(roles: UserRole[]) {
        if (!roles || !roles.length) {
            this.roleGroups = [];
            return;
        }

        const roleGroups = roles.reduce((groups, role) => {
            const name = role.SharedRoleName || '';

            switch (name.split('.')[0]) {
                case 'Accounting':
                    groups[0].roles.push(role);
                break;
                case 'Sales':
                    groups[1].roles.push(role);
                break;
                case 'Payroll':
                    groups[2].roles.push(role);
                break;
                case 'Timetracking':
                    groups[3].roles.push(role);
                break;
                case 'Bank':
                    groups[4].roles.push(role);
                break;
                default:
                    groups[5].roles.push(role);
                break;
            }

            return groups;
        }, [
            { label: 'Regnskap', roles: [] },
            { label: 'Salg', roles: [] },
            { label: 'Lønn', roles: [] },
            { label: 'Timeføring', roles: [] },
            { label: 'Bank', roles: [] },
            { label: 'Diverse', roles: [] },
        ]);

        this.roleGroups = roleGroups.filter(group => group.roles.length > 0);
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
