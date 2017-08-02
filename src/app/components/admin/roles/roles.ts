import {Component, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig} from '../../../../framework/ui/unitable/index';
import {UniField, FieldType} from '../../../../framework/ui/uniform/index';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';

import {UniModalService} from '../../../../framework/uniModal/barrel';

import {Role, Permission} from '../../../unientities';
import {RoleService, PermissionService, ErrorService} from '../../../services/services';
import {Http} from '@angular/http';

@Component({
    selector: 'uni-roles',
    templateUrl: './roles.html'
})

export class UniRoles {
    @ViewChild(UniTable)
    private table: UniTable;

    private hasUnsavedChanges: boolean;

    private permissions: Permission[];
    private roles: any[];
    private displayRolePermisssions: any[] = [];
    private selectedRole: Role;
    private selectedIndex: number = 0;

    private rolesTableConfig: UniTableConfig;
    private permissionsTableConfig: UniTableConfig;
    private toolbarConfig: IToolbarConfig;
    private saveActions: IUniSaveAction[];

    private formModel$: BehaviorSubject<Role> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    constructor(
        private roleService: RoleService,
        private permissionService: PermissionService,
        private errorService: ErrorService,
        private http: Http,
        private tabService: TabService,
        private modalService: UniModalService
    ) {
        this.tabService.addTab({
            name: 'Roller',
            url: '/admin/roles',
            moduleID: UniModules.Roles,
            active: true
        });

        this.initToolbar();
        this.initTableConfigs();
        this.initFormConfig();

        this.roleService.GetAll(null).subscribe(
            res => {
                this.roles = res.length ? res : [this.getNewRole()];
                setTimeout(() => {
                    this.table.focusRow(0);
                });
            },
            err => this.errorService.handle(err)
        );

        this.permissionService.GetAll(null).subscribe(
            res => this.permissions = res,
            err => this.errorService.handle(err)
        );
    }

    public onRowSelected(event) {
        if (!event.rowModel) {
            return;
        }

        this.selectedIndex = event.rowModel['_originalIndex'];
        this.selectedRole = this.roles[this.selectedIndex];
        this.formModel$.next(this.selectedRole);
        this.displayRolePermisssions = this.selectedRole.RolePermissions.filter((permission) => {
            return !permission.Deleted;
        });
      //  console.log(this.displayRolePermisssions);
    }

    public onPermissionAdded(permission: Permission) {
        if (!permission) {
            return;
        }

        this.selectedRole.RolePermissions.push(<any> {
            RoleID: this.selectedRole.ID,
            PermissionID: permission.ID,
            Permission: permission,
            hasUnsavedChanges: true,
            _createguid: this.roleService.getNewGuid()
        });

        this.hasUnsavedChanges = true;
        this.selectedRole.RolePermissions = [...this.selectedRole.RolePermissions];
        this.displayRolePermisssions = this.selectedRole.RolePermissions.filter(role => !role.Deleted);
    }

    public onPermissionDeleted(event) {
        const permission = event.rowModel;
        this.hasUnsavedChanges = true;

        if (permission['_createguid']) {
             // permission has not been saved yet, just remove it from the array
            this.selectedRole.RolePermissions.splice(permission['_originalIndex'], 1);
        } else {
            // permission has been saved, set deleted flag to remove it
            this.selectedRole.RolePermissions[permission['_originalIndex']].Deleted = true;
        }

        this.displayRolePermisssions = this.selectedRole.RolePermissions.filter((permission) => {
            return !permission.Deleted;
        });
   }

    public onFormChange(changes) {
        this.roles[this.selectedIndex] = this.formModel$.getValue();
        this.table.updateRow(this.selectedIndex, this.roles[this.selectedIndex]);
       // this.permissions[this.selectedIndex] = this.formModel$.getValue();
        //this.table.updateRow(this.onPermissionAdded, this.permissions[this.selectedIndex]);
        this.hasUnsavedChanges = true;
    }

    public canDeactivate() {
        if (!this.hasUnsavedChanges) {
            return true;
        }

        return this.modalService.openUnsavedChangesModal()
            .onClose
            .map((canDeactivate) => {
                if (!canDeactivate) {
                    this.tabService.addTab({
                        name: 'Roller',
                        url: '/admin/roles',
                        moduleID: UniModules.Roles,
                        active: true
                    });
                }

                return canDeactivate;
            });
    }



    private getNewRole() {
        return {
            Label: 'Ny rolle',
            Name: '',
            Description: '',
            RolePermissions: []
        };
    }

    private initToolbar() {
        this.toolbarConfig = {
            title: 'Roller',
            navigation: {
                add: () => {
                    this.roles.unshift(this.getNewRole());
                    this.roles = [...this.roles];
                    this.table.focusRow(0);
            }
           }

        };

        this.saveActions = [{
            label: 'Lagre',
            main: true,
            disabled: false,
            action: (completeCallback) => {
                if (this.selectedRole.ID) {
                    this.roleService.Put(this.selectedRole.ID, this.selectedRole).subscribe(
                        (res) => {
                            this.hasUnsavedChanges = false;
                            this.selectedRole = res;
                            completeCallback('Rolle lagret');
                        },
                        (err) => {
                            completeCallback('Feil under lagring av rolle');
                            this.errorService.handle(err);

                        }
                    );
                } else {
                    this.roleService.Post(this.selectedRole).subscribe(
                        (res) => {
                            this.hasUnsavedChanges = false;
                            this.selectedRole = res;
                            completeCallback('Rolle lagret');
                        },
                        (err) => {
                            completeCallback('Feil under lagring av rolle');
                            this.errorService.handle(err);

                        }
                    );
                }

            }
        }];
    }

    private initTableConfigs() {
        this.rolesTableConfig = new UniTableConfig(false, true, 15)
            .setSearchable(true)
            .setColumns([new UniTableColumn('Label')]);

        this.permissionsTableConfig = new UniTableConfig(false, true, 15)
            .setDeleteButton(true)
            .setColumns([
                new UniTableColumn('Permission.Name')
            ]);

    }

    private initFormConfig() {
        this.formConfig$.next({});
        this.formFields$.next([
            <any> {
                ComponentLayoutID: 1,
                EntityType: 'Role',
                Property: 'Label',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Label',
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
                EntityType: 'Role',
                Property: 'Name',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                LookupField: false,
                Label: 'Navn',
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
                EntityType: 'Role',
                Property: 'Description',
                Placement: 1,
                Hidden: false,
                FieldType: FieldType.TEXTAREA,
                ReadOnly: false,
                LookupField: false,
                Label: 'Beskrivelse',
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
        ]);
    }
}
