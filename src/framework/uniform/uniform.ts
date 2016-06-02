import {
    Component, EventEmitter, Input, Output, ViewChildren, QueryList, SimpleChange
} from '@angular/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from '@angular/common';
import {FieldLayout} from '../../app/unientities';
import {UniFieldLayout} from './unifieldlayout';
import {UniField} from './unifield';
import {UniCombo} from './unicombo';
import {UniFieldSet} from './unifieldset';
import {UniSection} from './unisection';
declare var _; // lodash

/**
 * Form component that wraps form elements
 */
@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, UniField, UniCombo, UniFieldSet, UniSection],
    providers: [FORM_PROVIDERS],
    template: `
        <form (submit)="submit($event)" [ngFormModel]="controls" [hidden]="Hidden">
            <template ngFor let-item [ngForOf]="groupedFields" let-i="index">
                <uni-field 
                    *ngIf="isField(item)"
                    [controls]="controls"
                    [field]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">
                </uni-field>
                <uni-combo-field 
                    *ngIf="isCombo(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">
                </uni-combo-field>
                <uni-field-set 
                    *ngIf="isFieldSet(item)" 
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">                    
                </uni-field-set>
                <uni-section 
                    *ngIf="isSection(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">                        
                </uni-section>
            </template>
            <button *ngIf="config.submitText" type="submit" [disabled]="!controls.valid">{{config.submitText}}</button>
        </form>
    `
})
export class UniForm {

    @Input()
    public config: any;

    @Input()
    public fields: FieldLayout[];

    @Input()
    public model: any;

    @Output()
    public onSubmit: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    @ViewChildren(UniFieldSet)
    public fieldsetElements: QueryList<UniFieldSet>;

    @ViewChildren(UniSection)
    public sectionElements: QueryList<UniSection>;

    public get Fields(): { [propKey: string]: UniField } {
        if (this._fields) {
            return this._fields;
        }
        // set fields
        return this._fields;
    }

    private controls: ControlGroup;
    private _fields: { [propKey: string]: UniField } = {};
    private groupedFields: any[];

    private readyFields: number;
    private totalFields: number;

    private hidden: boolean = false;
    public get Hidden() { return this.hidden; }

    public set Hidden(value: boolean) {
        this.hidden = value;
    }

    constructor(private builder: FormBuilder) {

    }

    public ngOnInit() {
        this.controls = this.builder.group({});
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            this.groupedFields = this.groupFields();
        }
    }

    public ngAfterViewInit() {
        let sections = this.sectionElements.toArray();
        let fieldsets = this.fieldsetElements.toArray();
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields, fieldsets, sections);

        // cache fields;
        this.fields.forEach((field: UniFieldLayout) => {
            this._fields[field.Property] = this.field(field.Property);
        });

        this.totalFields = all.length;
        this.readyFields = 0;
    }

    public onReadyHandler(item: UniField | UniCombo | UniFieldSet | UniSection) {
        this.readyFields++;
        if (this.readyFields === this.totalFields) {
            this.onReady.emit(this);
        }
    }

    public onChangeHandler(model: any) {
        var invalids = []
        var controls = this.controls.controls;
        for(var prop in controls) {
            if (controls.hasOwnProperty(prop)) {
                if (!controls[prop].valid) {
                    invalids.push(prop);
                }
                    
            }    
        }
        console.log(invalids.join(', '));
        this.onChange.emit(model);
    }


    public readMode() {
        this.fieldElements.forEach((f) => f.readMode());
        this.fieldsetElements.forEach((fs) => fs.readMode());
        this.sectionElements.forEach((s) => s.readMode());
    }
    public editMode() {
        this.fieldElements.forEach((f) => f.editMode());
        this.fieldsetElements.forEach((fs) => fs.editMode());
        this.sectionElements.forEach((s) => s.editMode());
    }

    public section(id: number) {
        var item: UniSection[] = this.sectionElements.filter((section: UniSection) => {
            return section.sectionId === id;
        });
        if (item.length > 0) {
            return item[0];
        }
    }

    public fieldset(fieldsetId: number, sectionId?: number) {
        if (!sectionId) {
            var item: UniFieldSet[] = this.fieldsetElements.filter((fieldset: UniFieldSet) => {
                return fieldset.fieldsetId === fieldsetId;
            });
            if (item.length > 0) {
                return item[0];
            }
            return;
        } else {
            var section: UniSection = this.section(sectionId);
            if (section) {
                var fieldset: UniFieldSet[] = section.fieldsetElements.filter((fs: UniFieldSet) => {
                    return fs.fieldsetId === fieldsetId;
                });
                if (fieldset.length > 0) {
                    return fieldset[0];
                }
            }
            return;
        }
    }

    public field(property: string): UniField {
        // Look inside top level fields;
        var item: UniField[] = this.fieldElements.filter((cmp: UniField) => {
            return cmp.field.Property === property;
        });
        if (item.length > 0) {
            return item[0];
        }

        // Look inside fieldsets
        var element: UniField;
        this.fieldsetElements.forEach((cmp: UniFieldSet) => {
            if (!element) {
                element = cmp.field(property);
            }
        });
        if (element) {
            return element;
        }

        // Look inside sections
        this.sectionElements.forEach((cmp: UniSection) => {
            if (!element) {
                element = cmp.field(property);
            }
        });
        if (element) {
            return element;
        }

        // nothing found
        return;
    }

    private submit(event) {
        event.preventDefault();
        this.onSubmit.emit(this.model);
    }

    private isField(field: UniFieldLayout): boolean {
        return !_.isArray(field);
    }
    
    private isCombo(field: UniFieldLayout): boolean {
        return _.isArray(field) && !field[0].Section && !field[0].FieldSet && field[0].Combo > 0;
    }

    private isFieldSet(field: UniFieldLayout): boolean {
        return _.isArray(field) && !field[0].Section && field.FieldSet > 0;
    }

    private isSection(field: UniFieldLayout): boolean {
        return _.isArray(field) && field[0].Section > 0;
    }

    private groupFields() {
        let group = [], section = [], fieldset = [], combo = [];
        let lastSection = 0, lastFieldSet = 0, lastCombo = 0;
        
        let closeGroups = (field) => {
            if (field.Combo !== lastCombo && combo.length > 0) { // close last combo
                group.push(combo);
                combo = [];
            }
            if (field.FieldSet !== lastFieldSet && fieldset.length > 0) { // close last fieldset
                group.push(fieldset);
                fieldset = [];
            }
            if (field.Section !== lastSection && section.length > 0) { // close last section
                group.push(section);
                section = [];
            }   
            lastCombo = field.Combo;
            lastSection = field.Section;
            lastFieldSet = field.FieldSet;     
        };
        
        this.fields.forEach((x: UniFieldLayout) => {
            let field = new UniFieldLayout(x);
            if (!field.Section && !field.FieldSet && !field.Combo) { // manage fields
                closeGroups(field);
                group.push(field);
            } else if (!field.Section && !field.FieldSet && field.Combo > 0) { // manage combo
                closeGroups(field);
                combo.push(field);
            } else if (!field.Section && field.FieldSet > 0) { // manage fieldsets
                closeGroups(field);
                fieldset.push(field);
            } else if (field.Section > 0) { // manage sections
                closeGroups(field);
                section.push(field);
            }
        });
        if (combo.length > 0) { // add combo to the group
            group.push(combo);
        }
        if (fieldset.length > 0) { // add fielsets to the group
            group.push(fieldset);
        }
        if (section.length > 0) { // add section to the group
            group.push(section);
        }
        return group;
    }
}