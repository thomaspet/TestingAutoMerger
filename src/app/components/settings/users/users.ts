import {Component, QueryList, ViewChildren} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniHttp} from '../../../../framework/core/http/http';
import {UniField, FieldType} from 'uniform-ng2/main';
import {UniTable, UniTableConfig, UniTableColumn, IContextMenuItem} from 'unitable-ng2/main';
import {RoleService, ErrorService, UserService} from '../../../services/services';
import {Role, UserRole, User} from '../../../unientities';


@Component({
    selector: 'uni-users',
    templateUrl: './users.html'
})
export class Users {
    @ViewChildren(UniTable)
    private tables: QueryList<UniTable>;

    private hasUnsavedChanges: boolean;

    // New user Form
    private newUserForm: FormGroup;
    private errorMessage: string;

    // Users table
    private roles: UserRole[];
    private users: User[] = [];
    private userRoles: UserRole[] = [];

    private selectedUser: User;
    private selectedIndex: number = 0;
    private userTableConfig: UniTableConfig;
    private roleTableConfig: UniTableConfig;

    private formModel$: BehaviorSubject<User> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    // Misc
    private busy: boolean = false;

    constructor(
        private http: UniHttp,
        private tabService: TabService,
        private roleService: RoleService,
        private userService: UserService,
        private errorService: ErrorService
    ) {
        this.initTableConfigs();
        this.initFormConfigs();

    this.newUserForm = new FormGroup({
    Email: new FormControl('', this.isInvalidEmail)
        });
        this.roleService.GetAll(null).subscribe(
            (res) => {
                this.roles = res || [];
            },
            err => this.errorService.handle(err)
        );

        this.getUsers(true);
        this.initTableConfigs();
        this.initFormConfigs();
        this.errorMessage = '';

    }

    private saveUserRole(userRole) {
        this.http.asPOST()
            .usingBusinessDomain()
            .withEndPoint('userroles')
            .withBody(userRole)
            .send()
            .subscribe(
                res => this.getUserRoles(),
                err => this.errorService.handle(err)
            );
    }

    private getUserRoles() {
        this.userService.getRolesByUserId(this.selectedUser.ID)
            .subscribe(
                res => this.userRoles = res || [],
                err => this.errorService.handle(err)
            );
    }

    public onUserSelected(event) {
        if (this.hasUnsavedChanges && event.rowModel['_originalIndex'] !== this.selectedIndex) {
            if (!confirm('Du har ulagrede endringer. Ønsker du å forkaste disse?')) {
                this.tables.first.focusRow(this.selectedIndex);
                return;
            }
        } else {
            this.selectedUser = event.rowModel;
            this.selectedIndex = event.rowModel['_originalIndex'];
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

        this.saveUserRole(userRole);
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

     private initTableConfigs() {
        const contextMenuItems: IContextMenuItem[] = [
            {
                label: 'Send ny invitasjon',
                action: rowModel => this.resendInvite(rowModel),
                disabled: (rowModel) => {
                    return (rowModel['StatusCode'] === 110001);
                }
            },
            {
                label: 'Fjern bruker',
                action: rowModel => this.revokeUser(rowModel),
                disabled: (rowModel) => {
                    return( rowModel ['StatusCode'] === 110001);
                }

            },
            {
                label: 'Fjern bruker',
                action: rowModel => this.revokeUser(rowModel),
                disabled: (rowModel) => {
                    return(rowModel ['StatusCode'] === 110000);
                }
            }
        ];

        this.userTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setContextMenu(contextMenuItems)
            .setColumns([
                new UniTableColumn('DisplayName', 'Navn')
                    .setTemplate(rowModel => rowModel['DisplayName'] || rowModel['Email']),

                new UniTableColumn('_StatusText', 'Status')
                    .setTemplate(rowModel => this.getStatusCodeText(rowModel['StatusCode']))]);

        this.roleTableConfig = new UniTableConfig(false, true, 15)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('SharedRoleName')

           ]);
     }

    private getUsers(focusFirst?: boolean) {
        this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('users')
            .send()
            .map(response => response.json())
            .subscribe(
                (response) => {
                    this.users = response.map(user => {
                        user._statusText = this.getStatusCodeText(user.StatusCode);

                        return user;

                    });

                    if (focusFirst) {
                        setTimeout(() => this.tables.last.focusRow(0));
                    }
                },
                err => this.errorService.handle(err)
            );
    }

    private sendInvite(user?) {
        this.errorMessage = '';
        let companyId = JSON.parse(localStorage.getItem('activeCompany')).id;
        let newUser = user || this.newUserForm.value;

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
                        Email: new FormControl('', this.isInvalidEmail)
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
        }
        // If user has not responded to invite
        else {
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

    private getStatusCodeText(statusCode: number): string {
        switch (statusCode) {
            case 110000: return 'Invitert';
            case 110001: return 'Aktiv';
            case 110002: return 'Inaktiv';
            default: return 'Ingen status';
        }
    }

    private isInvalidEmail(control: FormControl) {
        let testResult = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(control.value);

        if (!testResult) {
            return {'isInvalidEmail': true};
        }

        return null;
    }
    private initFormConfigs() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                ComponentLayoutID: 1,
                EntityType: 'User',
                Property: 'DisplayName',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                LookupField: false,
                Label: 'Visningsnavn',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            },
            <any>{
                ComponentLayoutID: 1,
                EntityType: 'User',
                Property: 'Email',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Epost',
                Description: null,
                HelpText: null,
                FieldSet: 0,
                Section: 0,
                Placeholder: null,
                Options: null,
                LineBreak: null,
                Combo: null,
                Sectionheader: '',
                hasLineBreak: false,
                Validations: []
            }
         ]);
      }
}

