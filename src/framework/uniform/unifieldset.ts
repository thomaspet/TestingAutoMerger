import {Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup} from '@angular/common';
import {UniFieldLayout} from './interfaces';
import {UniField} from './unifield';
import {UniCombo} from './unicombo';
declare var _; // lodash

@Component({
    selector: 'uni-field-set',
    template: `
        <fieldset [hidden]="Hidden">
            <legend *ngIf="config.legend">{{config.legend}}</legend>
            <template ngFor let-field [ngForOf]="groupedFields" let-i="index">
                <uni-combo-field
                    *ngIf="isCombo(field)"
                    [controls]="controls"
                    [field]="field" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">
                </uni-combo-field>
                <uni-field
                    *ngIf="isField(field)"
                    [controls]="controls"
                    [field]="field" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)">
                </uni-field>
            </template>
        </fieldset>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, UniField, UniCombo],
    providers: [FORM_PROVIDERS]
})
export class UniFieldSet {

    @Input()
    public fields: UniFieldLayout[];

    @Input()
    public controls: ControlGroup;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<UniFieldSet> = new EventEmitter<UniFieldSet>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    @ViewChildren(UniCombo)
    public comboElements: QueryList<UniCombo>;

    public fieldsetId: number;
    public sectionId: number;
    public comboId: number;
    
    private groupedFields: any;
    public config: any;

    private hidden: boolean = false;
    public get Hidden() { return this.hidden; }
    
    public set Hidden(value: boolean) {
        this.hidden = value;
        this.cd.markForCheck();
    } 

    private readyFields: number;
    private totalFields: number;
    
    constructor(private cd: ChangeDetectorRef) { 
        this.readyFields = 0;
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.fieldsetId = this.fields[0].FieldSet;
                this.comboId = this.fields[0].Combo;
                
                this.config = {};
                this.config.legend = this.fields[0].Legend;
            }
            this.groupedFields = this.groupFields();
        }
    }

    public ngAfterViewInit() {
        let fields = this.fieldElements.toArray();
        let combos = this.comboElements.toArray();
        this.totalFields = [].concat(fields, combos).length;
        this.readyFields = 0;
    }

    public onReadyHandler(field: UniField) {
        this.readyFields++;
        if (this.readyFields === this.totalFields) {
            this.onReady.emit(this);
        }
    }
    
    public onChangeHandler(model: any) {
        this.onChange.emit(model);
    }

    public readMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.readMode();
        }); 
        this.comboElements.forEach((f: UniCombo) => {
            f.readMode();
        }); 
        this.cd.markForCheck();       
    }

    public editMode() {
        this.fieldElements.forEach((f: UniField) => {
            f.editMode();
        });
        this.comboElements.forEach((f: UniCombo) => {
            f.editMode();
        }); 
        this.cd.markForCheck();
    }

    public field(property: string): UniField {
        // look after fields
        var item: UniField[] = this.fieldElements.filter((cmp: UniField) => {
            return cmp.field.Property === property;
        });
        if (item.length > 0) {
            return item[0];
        }

        // Look inside combos
        var element: UniField;
        this.comboElements.forEach((cmp: UniCombo) => {
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
    
    private isField(field: UniFieldLayout): boolean {
        return !_.isArray(field);
    }
    private isCombo(field: UniFieldLayout): boolean {
        return _.isArray(field) && field[0].Combo > 0;
    }
    
    private groupFields() {
        let group = [], combo = [];
        let lastCombo = 0;
        let closeGroups = (field) => {
            if (field.Combo !== lastCombo && combo.length > 0) { // close last combo
                group.push(combo);
                combo = [];
            }
            lastCombo = field.Combo;     
        };
        this.fields.forEach((field: UniFieldLayout) => {
            if (!field.Combo) {// manage fields
                closeGroups(field);
                group.push(field);
            } else if (field.Combo > 0) { // manage combo
                closeGroups(field);
                combo.push(field);
            }
        });
        if (combo.length > 0) { // add combo to the last group
            group.push(combo);
        }
        return group;
    }
}
