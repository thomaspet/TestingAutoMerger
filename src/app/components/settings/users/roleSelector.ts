import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Role} from '../../../unientities';
import {UniFieldLayout, FieldType} from 'uniform-ng2/main';

@Component({
     selector: 'uni-role-selector',
    template: `
        <uni-autocomplete-input *ngIf="field"
            [model]="model"
            [field]="field"
            (changeEvent)="change($event)">
        </uni-autocomplete-input>
    `
})

export class RoleSelector {
    @Input()
    public role: Role[];

    @Output()
    public roleSelected: EventEmitter<Role> = new EventEmitter<Role>();

    private model: any = {};
    private field: UniFieldLayout;

    constructor() {}

    public ngOnChanges(changes) {
        if (this.role) {
            let field = new UniFieldLayout();
            field.Property = 'RoleID';
            field.Placeholder = 'Legg til rolle';
            field.FieldType = FieldType.AUTOCOMPLETE;
            field.Options = {
                source: this.role,
                valueProperty: 'ID',
                template: role => role && role.Name,
                debounceTime: 100,
            };
            this.field = field;
        }
    }
    public change(event) {
        const roleID = event.RoleID.currentValue;
        const selected = this.role.find(item => item.ID === roleID);

        this.roleSelected.next(selected);
        this.model = {};
    }
}

