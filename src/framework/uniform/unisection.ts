import {Component, Input, Output, HostBinding, EventEmitter, QueryList, ViewChildren, ChangeDetectorRef, ChangeDetectionStrategy, SimpleChange} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {UniFieldLayout} from './interfaces';
import {UniField} from './unifield';
import {UniCombo} from './unicombo';
import {UniFieldSet} from './unifieldset';
import {FieldLayout} from "../../app/unientities";

declare var _; // lodash

@Component({
    selector: 'uni-section',
    template: `
        <article class="collapsable" [ngClass]="{'-is-open':isOpen}">
            <h4 *ngIf="config.legend" (click)="toggle()">{{config.legend}}</h4>
            <div class="collapsable-content">
                <template ngFor let-item [ngForOf]="groupedFields" let-i="index">
                    <uni-field 
                        *ngIf="isField(item) && !item?.Hidden"
                        [controls]="controls"
                        [field]="item" 
                        [model]="model"
                        (readyEvent)="onReadyHandler($event)"
                        (changeEvent)="onChangeHandler($event)"
                        (focusEvent)="onFocusHandler($event)">
                    </uni-field>
                    <uni-combo-field 
                        *ngIf="isCombo(item)"
                        [controls]="controls"
                        [fields]="item"
                        [model]="model"
                        (readyEvent)="onReadyHandler($event)"
                        (changeEvent)="onChangeHandler($event)"
                        (focusEvent)="onFocusHandler($event)">
                    </uni-combo-field>
                    <uni-field-set 
                        *ngIf="isFieldSet(item)" 
                        [controls]="controls"
                        [fields]="item" 
                        [model]="model"
                        (readyEvent)="onReadyHandler($event)"
                        (changeEvent)="onChangeHandler($event)"
                        (focusEvent)="onFocusHandler($event)">                    
                    </uni-field-set>
                    <uni-linebreak *ngIf="hasLineBreak(item)"></uni-linebreak>
                </template>
            </div>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSection {
    @Input()
    public fields: UniFieldLayout[];

    @Input()
    public controls: FormGroup;

    @Input()
    public model: any;
    @Input()
    public formConfig: any;

    @Output()
    public readyEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public toggleEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

	@Output()
    public focusEvent: EventEmitter<UniSection> = new EventEmitter<UniSection>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    @ViewChildren(UniFieldSet)
    public fieldsetElements: QueryList<UniFieldSet>;

    @ViewChildren(UniCombo)
    public comboElements: QueryList<UniCombo>;

    public sectionId: number;
    public isOpen: boolean = false;

    private groupedFields: any;
    private config: any = {};

    private readyFields: number;

    private hidden: boolean = false;

    @HostBinding('hidden')
    public get Hidden() { return this.hidden; }

    public set Hidden(value: boolean) {
        this.hidden = value;
        this.cd.markForCheck();
    }

    constructor(private cd: ChangeDetectorRef) { }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.formConfig.sections[this.sectionId].isOpen = this.isOpen;
        this.cd.markForCheck();
        this.toggleEvent.emit({sectionId: this.sectionId, isOpen: this.isOpen});
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.config.legend = this.fields[0].Sectionheader;

                if (!this.formConfig.sections) {
                    this.formConfig.sections = {};
                }
                if (!this.formConfig.sections[this.sectionId]) {
                    this.formConfig.sections[this.sectionId] = {
                        isOpen: false
                    };
                }
                this.isOpen = this.formConfig.sections[this.sectionId].isOpen;

            }
            this.groupedFields = this.groupFields();
        }
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onReadyHandler(item: UniField | UniCombo | UniFieldSet | UniSection) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.readyEvent.emit(this);
        }
    }

    public onFocusHandler(event) {
        this.focusEvent.emit(event);
    }

    public countElements() {
        let combos = this.comboElements.toArray();
        let fieldsets = this.fieldsetElements.toArray();
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields, fieldsets, combos);

        return all.length;
    }

    public onChangeHandler(model: any) {
        this.changeEvent.emit(model);
    }
    
    public readMode() {
        this.fieldsetElements.forEach((fs: UniFieldSet) => {
            fs.readMode();
        });
        this.comboElements.forEach((f: UniCombo) => {
            f.readMode();
        });
        this.fieldElements.forEach((f: UniField) => {
            f.readMode();
        });
        this.cd.markForCheck();
    }

    public editMode() {
        this.fieldsetElements.forEach((fs: UniFieldSet) => {
            fs.editMode();
        });
        this.comboElements.forEach((f: UniCombo) => {
            f.editMode();
        });
        this.fieldElements.forEach((f: UniField) => {
            f.editMode();
        });
        this.cd.markForCheck();
    }

    public field(property: string) {
        // look into top lever fields
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

        // Look inside fieldsets
        this.fieldsetElements.forEach((cmp: UniFieldSet) => {
            if (!element) {
                element = cmp.field(property);
            }
        });
        if (element) {
            return element;
        }

        return;
    }

    private isField(field: UniFieldLayout): boolean {
        return !_.isArray(field);
    }
    private isCombo(field: UniFieldLayout): boolean {
        return _.isArray(field) && field[0].FieldSet === 0 && field[0].Combo > 0;
    }
    private isFieldSet(field: UniFieldLayout): boolean {
        return _.isArray(field) && field[0].FieldSet > 0;
    }

    private hasLineBreak(item: FieldLayout) {
        return item.LineBreak;
    }

    private groupFields() {
        let group = [], fieldset = [], combo = [];
        let lastFieldSet = 0, lastCombo = 0;
        let closeGroups = (field) => {
            if (field.Combo !== lastCombo && combo.length > 0) { // close last combo
                group.push(combo);
                combo = [];
            }
            if (field.FieldSet !== lastFieldSet && fieldset.length > 0) { // close last fieldset
                group.push(fieldset);
                fieldset = [];
            }
            lastCombo = field.Combo;
            lastFieldSet = field.FieldSet;     
        };
        this.fields.forEach((field: UniFieldLayout) => {
            if (!field.FieldSet && !field.Combo) {// manage fields
                closeGroups(field);
                group.push(field);
            } else if (!field.FieldSet && field.Combo > 0) { // manage combo
                closeGroups(field);
                combo.push(field);
            }else if (field.FieldSet > 0) {// manage fieldsets
                closeGroups(field);
                fieldset.push(field);
            }
        });
        if (combo.length > 0) { // add combo to the last group
            group.push(combo);
        }
        if (fieldset.length > 0) { // add fielsets to the last group
            group.push(fieldset);
        }
        return group;
    }
}
