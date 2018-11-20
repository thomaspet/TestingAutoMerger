import {Component, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniField, FieldType} from '../../../../framework/ui/uniform/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {UniTableConfig, UniTableColumn, IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {
    RoleService,
    ErrorService,
    UserService,
    ElsaProductService,
    ElsaPurchaseService
} from '../../../services/services';
import {Role, UserRole, User, Company} from '../../../unientities';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {UniChangePasswordModal} from './changePasswordModal';
import {UniRegisterBankUserModal} from '@app/components/settings/users/register-bank-user.modal';
import {UniAdminPasswordModal} from '@app/components/settings/users/admin-password.modal';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import { Observable } from 'rxjs';
import {ManageProductsModal} from '@uni-framework/uni-modal/modals/manageProductsModal';
import {EmailService} from '@app/services/common/emailService';


@Component({
    selector: 'uni-users',
    templateUrl: './users.html'
})
export class Users {
    @ViewChild('usersTable') table: AgGridWrapper;

    private hasUnsavedChanges: boolean;
    private currentUser: User;
    private selectedIndex: number = 0;
    private hasAutobankProduct: boolean = false;

    newUserForm: FormGroup;
    errorMessage: string;

    roles: Role[];
    users: User[] = [];
    userRoles: UserRole[] = [];
    selectedUser: User;

    userTableConfig: UniTableConfig;
    roleTableConfig: UniTableConfig;

    formModel$: BehaviorSubject<User> = new BehaviorSubject(null);
    formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    // Misc
    public busy: boolean = false;

    constructor(
        private http: UniHttp,
        private tabService: TabService,
        private roleService: RoleService,
        private userService: UserService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
        private toast: ToastService,
        private elsaProductService: ElsaProductService,
        private elsaPurchasesService: ElsaPurchaseService,
        private emailService: EmailService,
    ) {
        this.newUserForm = new FormGroup({
            Email: new FormControl('', this.isInvalidEmail.bind(this))
        });
        this.errorMessage = '';

        Observable.forkJoin(
            this.userService.getCurrentUser(),
            this.roleService.GetAll(),
        )
            .subscribe(
                parts => {
                    this.currentUser = parts[0];
                    this.initTableConfigs();
                    this.initFormConfigs();
                    this.checkAutobankAccess();

                    this.roles = parts[1] || [];

                    this.getUsers(true);
                    this.initTableConfigs();
                    this.initFormConfigs();
                },
                err => this.errorService.handle(err)
            );
    }

    private saveUserRole(userRole): Observable<any> {
        return this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('userroles')
            .withBody(userRole)
            .send();
    }

    private getUserRoles() {
        this.userService.getRolesByUserId(this.selectedUser.ID)
            .subscribe(
                res => this.userRoles = res || [],
                err => this.errorService.handle(err)
            );
    }

    public onUserSelected(selectedRow) {
        if (this.hasUnsavedChanges && selectedRow['_originalIndex'] !== this.selectedIndex) {
            if (!confirm('Du har ulagrede endringer. Ønsker du å forkaste disse?')) {
                this.table.focusRow(this.selectedIndex);
                return;
            }
        } else {
            this.selectedUser = selectedRow;
            this.selectedIndex = selectedRow['_originalIndex'];
            this.formModel$.next(this.selectedUser);

            this.getUserRoles();
        }
    }

    public onRoleAdded(role: Role) {
        if (!role) {
            return;
        }

        const userRole = {
            SharedRoleId: role.ID,
            SharedRoleName: role.Name,
            UserID: this.selectedUser.ID
        };

        this.saveUserRole(userRole).subscribe(
            res => this.getUserRoles(),
            err => this.errorService.handle(err)
        );
    }

    public onRoleDeleted(event) {
        this.http.asDELETE()
            .usingBusinessDomain()
            .withEndPoint('userroles/' + event.rowModel.ID)
            .send()
            .subscribe(
                res => this.getUserRoles(),
                err => this.errorService.handle(err)
            );
}

    public onFormChange(changes) {
        this.hasUnsavedChanges = true;
        this.selectedUser = this.formModel$.getValue();
    }

    // Copied from bankComponent.ts - line 252
    private checkAutobankAccess() {
        // Replace purchases getAll with filtered request when filtering works..
        Observable.forkJoin(
            this.elsaProductService.GetAll(),
            this.elsaPurchasesService.GetAll()
        ).subscribe(
            res => {
                const [products, purchases] = res;

                // TODO: fix this check when we know what to look for..
                const autobank = products && products.find(product => {
                    return product.name && product.name.toLowerCase() === 'autobank';
                });

                this.hasAutobankProduct = autobank && purchases.some(purchase => purchase.productID === autobank.id);
            },
            err => console.error(err)
        );
    }

     private initTableConfigs() {
        const contextMenuItems: IContextMenuItem[] = [
            {
                label: 'Send ny invitasjon',
                action: rowModel => this.resendInvite(rowModel),
                disabled: user => user.StatusCode === 110001
            },
            {
                label: 'Fjern bruker',
                action: rowModel => this.revokeUser(rowModel),
                disabled: (user: User) => {
                    return user.StatusCode !== 110001 && user.StatusCode !== 110000;
                }
            },
            {
                label: 'Register som bankbruker',
                action: (user: User) => {
                    /*
                        Anders 02.03.2018
                        This is a frontend hack to prevent an issue where setting
                        a user without roles as bank user causes them to lose most
                        of the permissions required to make the system work..
                        If the user we set as bank user does not have any roles we
                        try to give them the administrator role. If that fails we
                        toast a message saying the user needs to have a role and
                        terminate the process.
                        This should be handled on backend obviously, but frontend is
                        easier to quickfix in prod.
                    */
                    const rolesOnUser = (this.userRoles || []).filter(userRole => userRole.UserID === user.ID);

                    if (!rolesOnUser || !rolesOnUser.length) {
                        const adminRole = this.roles.find(role => role.Name.toLowerCase() === 'administrator');
                        if (adminRole) {
                            const adminUserRole: Partial<UserRole> = {
                                SharedRoleId: adminRole.ID,
                                SharedRoleName: adminRole.Name,
                                UserID: user.ID
                            };

                            this.saveUserRole(adminUserRole).subscribe(
                                res => {
                                    this.registerBankUser(user);
                                },
                                err => {
                                    this.toast.addToast(
                                        'Brukeren mangler rolle',
                                        ToastType.bad, 0,
                                        'Bankbrukere må ha en eksisterende rolle knyttet til seg (f.eks administrator)'
                                    );
                                }
                            );
                        } else {
                            this.toast.addToast(
                                'Brukeren mangler rolle',
                                ToastType.bad, 0,
                                'Bankbrukere må ha en eksisterende rolle knyttet til seg (f.eks administrator)'
                            );
                        }
                    } else {
                        this.registerBankUser(user);
                    }
                },
                disabled: (user: User) => !!user.BankIntegrationUserName || !this.hasAutobankProduct
            },
            {
                label: 'Tilbakestill bankpassord',
                action: rowModel => this.resetAutobankPassword(rowModel),
                disabled: (user: User) => !this.currentUser.IsAutobankAdmin || !this.hasAutobankProduct || !user.BankIntegrationUserName
            },
            {
                label: 'Endre ditt autobankpassord',
                action: rowModel => this.changePassword(rowModel),
                disabled: (user: User) => this.currentUser.Email !== user.Email
                    || !user.BankIntegrationUserName || !this.hasAutobankProduct
            }
        ];

        this.userTableConfig = new UniTableConfig('settings.users.users', false, true, 15)
            .setSearchable(true)
            .setContextMenu(contextMenuItems)
            .setColumns([
                new UniTableColumn('DisplayName', 'Navn')
                    .setTemplate(rowModel => rowModel['DisplayName'] || rowModel['Email']),

                new UniTableColumn('_StatusText', 'Status')
                    .setTemplate(rowModel => this.getStatusCodeText(rowModel['StatusCode']))]);

        this.roleTableConfig = new UniTableConfig('settings.users.roles', false, true, 15)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('SharedRoleName', 'Roller')

           ]);
     }

    private getUsers(focusFirst?: boolean) {
        this.userService.GetAll(null).subscribe(
            (response) => {
                this.users = response.map(user => {
                    user._statusText = this.getStatusCodeText(user.StatusCode);
                    return user;
                });

                setTimeout(() => {
                    if (this.table) {
                        this.table.focusRow(focusFirst ? 0 : this.selectedIndex);
                    }
                });
            },
            err => this.errorService.handle(err)
        );
    }

    public sendInvite(user?) {
        this.errorMessage = '';
        const companyId = this.browserStorage.getItem('activeCompany').id;
        const newUser = user || this.newUserForm.value;

        this.busy = true;

        this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('user-verifications')
            .withBody({
                Email: newUser.Email,
                CompanyId: companyId
            })
            .send()
            .map(response => response.json())
            .finally(() => this.busy = false)
            .subscribe(
                (data) => {

                    // clear form
                    this.newUserForm = new FormGroup({
                        Email: new FormControl('', this.isInvalidEmail.bind(this))
                    });

                    this.getUsers();
                },
                err => this.errorService.handle(err)
            );
    }

    private resendInvite(user) {
        // If user is inactive
        if (user.StatusID === 110002) {
            this.http.asPOST()
                .usingBusinessDomain()
                .withEndPoint('users/' + user.ID)
                .send({action: 'activate'})
                .map(response => response.json())
                .subscribe(response => this.getUsers(), err => this.errorService.handle(err));
        } else {
            // If user has not responded to invite
            this.sendInvite(user);
        }
    }

    private revokeUser(user) {
        this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('users/' + user.ID)
            .send({ action: 'inactivate' })
            .map(response => response.json())
            .subscribe(response => this.getUsers(), err => this.errorService.handle(err));
    }

    private resetAutobankPassword(model: any) {
        const modal = this.modalService.open(UniAdminPasswordModal, { data: {
            isResetPassword: true
        }});

        modal.onClose.subscribe(result => {
            if (result) {
                this.http
                    .asPOST()
                    .usingBusinessDomain()
                    .withEndPoint('users/' + model.ID + '?action=reset-autobank-password')
                    .withBody({Password: result})
                    .send()
                    .map(res => res.json())
                    .subscribe(() => {
                        // Password has been reset
                        this.toast.addToast('Endring vellykket', ToastType.good, 10, 'Passord tilbakestilt for ' + model.DisplayName);
                    }, (err) => {
                        // Could not reset password
                        this.toast.addToast('Noe gikk galt', ToastType.bad, 10,
                            'Kunne ikke tilbakestille passord. Var adminpassordet korrekt?');
                    });
            }
        });
    }

    public changePassword(done) {
        this.modalService.open(UniChangePasswordModal, { header: 'Endre autobankpassord' }).onClose.subscribe((passwords) => {
            if (passwords) {
                this.userService.changeAutobankPassword({
                    Password: passwords.OldPass,
                    NewPassword: passwords.NewPass
                }).subscribe((res) => {
                    this.toast.addToast('Passordet er oppdatert', ToastType.good, 5);
                }, (err) => {
                    this.errorService.handle(err);
                    this.toast.addToast('Kunne ikke oppdatere passord!', ToastType.bad);
                });
            } else {
                this.toast.addToast('Ingenting endret', ToastType.warn, 3);
            }
        });
    }

    private getStatusCodeText(statusCode: number): string {
        switch (statusCode) {
            case 110000: return 'Invitert';
            case 110001: return 'Aktiv';
            case 110002: return 'Inaktiv';
            default: return 'Ingen status';
        }
    }

    private isInvalidEmail(control: FormControl) {
        const isValidEmail = this.emailService.isValidEmailAddress(control.value);
        if (!isValidEmail) {
            return {'isInvalidEmail': true};
        }

        return null;
    }
    private initFormConfigs() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                EntityType: 'User',
                Property: 'DisplayName',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'Visningsnavn',
                FieldSet: 0,
                Section: 0
            },
            <any>{
                EntityType: 'User',
                Property: 'Email',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'E-post',
                FieldSet: 0,
                Section: 0
            }
         ]);
    }

    private registerBankUser(user: User) {
        const modal = this.modalService.open(UniRegisterBankUserModal);
        modal.onClose.subscribe(bankData => {
            if (bankData && bankData.Password) {
                this.askForAdminPassoword(user, bankData);
            }
        });
    }

    private askForAdminPassoword(user, bankData) {
        const modal = this.modalService.open(UniAdminPasswordModal, { data: {
            user: user,
            bankData: bankData
        }});
        modal.onClose.subscribe(result => {
            if (result === true) {
                this.getUsers(false);
            }
        });
    }

    public editPurchases() {
        const company: Company = this.browserStorage.getItem('activeCompany');
        this.modalService
            .open(ManageProductsModal, {
                header: `Velg hvilke brukere som skal ha hvilke produkter i ${company.Name}`,
                data: {companyKey: company.Key},
            });
    }
}
