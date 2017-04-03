import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Permission} from '../../../unientities';
import {UniAutocompleteConfig, UniFieldLayout, FieldType} from 'uniform-ng2/main';

@Component({
    selector: 'uni-permission-selector',
    template: `
        <uni-autocomplete-input *ngIf="field"
            [model]="model"
            [field]="field"
            (changeEvent)="change($event)">
        </uni-autocomplete-input>
    `
})
export class PermissionSelector {
    @Input()
    public permissions: Permission[];

    @Output()
    public permissionSelected: EventEmitter<Permission> = new EventEmitter<Permission>();

    private model: any = {};
    private field: UniFieldLayout;

    constructor() {}

    public ngOnChanges(changes) {
        if (this.permissions) {
            let field = new UniFieldLayout();
            field.Property = 'PermissionID';
            field.Placeholder = 'Legg til rettighet';
            field.FieldType = FieldType.AUTOCOMPLETE;
            field.Options = {
                source: this.permissions,
                valueProperty: 'ID',
                template: permission => permission && permission.Name,
                debounceTime: 100,
            };

            this.field = field;
        }
    }

    public change(event) {
        const permissionID = event.PermissionID.currentValue;
        const selected = this.permissions.find(item => item.ID === permissionID);

        this.permissionSelected.next(selected);
        this.model = {};
    }

}
