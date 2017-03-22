import {Component, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {UniField, FieldType} from 'uniform-ng2/main';
import {IToolbarConfig} from './../../common/toolbar/toolbar';
import {IUniSaveAction} from '../../../../framework/save/save';

import {Role, RolePermission, Permission} from '../../../unientities';
import {RoleService, PermissionService, ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-roles',
    templateUrl: './roles.html'
})
export class UniRoles {
    @ViewChild(UniTable)
    private table: UniTable;

    private permissions: Permission[];
    private roles: any[];
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
        tabService: TabService
    ) {
        tabService.addTab({
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
        this.selectedIndex = event.rowModel['_originalIndex'];
        this.selectedRole = this.roles[this.selectedIndex];
        this.formModel$.next(this.selectedRole);
    }

    public onPermissionSelected(permission: Permission) {
        this.selectedRole.RolePermissions.push(<any> {
            RoleID: this.selectedRole.ID,
            PermissionID: permission.ID,
            Permission: permission,
            _createguid: this.roleService.getNewGuid()
        });

        this.selectedRole.RolePermissions = [...this.selectedRole.RolePermissions];
    }

    public onPermissionDeleted(event) {
        const permission = event.rowModel;

        if (permission['_createguid']) {
            // permission has not been saved yet, just remove it from the array
            this.selectedRole.RolePermissions.splice(permission['_originalIndex'], 1);
        } else {
            // permission has been saved, set deleted flag to remove it
            this.selectedRole.RolePermissions[permission['_originalIndex']].Deleted = true;
        }

        this.selectedRole.RolePermissions = [...this.selectedRole.RolePermissions];
    }

    public onFormChange(changes) {
        this.roles[this.selectedIndex] = this.formModel$.getValue();
        this.table.updateRow(this.selectedIndex, this.roles[this.selectedIndex]);
    }

    public canDeactivate() {
        console.log('canDeactivate implementation missing in roles.ts!');
        return true;
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
                completeCallback('Implementation missing');
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
