import {
    Component, EventEmitter, Input, Output, HostBinding, ViewChildren, QueryList, SimpleChange, ElementRef
} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {FieldLayout} from '../../app/unientities';
import {UniFieldLayout, KeyCodes} from './interfaces';
import {UniField} from './unifield';
import {UniCombo} from './unicombo';
import {UniFieldSet} from './unifieldset';
import {UniSection} from './unisection';
import {Observable} from 'rxjs/Observable';

declare var _; // lodash

/**
 * Form component that wraps form elements
 */
@Component({
    selector: 'uni-form',
    template: `
        <form (submit)="submit($event)" [formGroup]="controls" autocomplete="off">
            <template ngFor let-item [ngForOf]="groupedFields" let-i="index">
                <uni-field 
                    *ngIf="isField(item) && !item?.Hidden"
                    [controls]="controls"
                    [field]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)"
                    (onFocus)="onFocusHandler($event)">
                </uni-field>
                <uni-combo-field 
                    *ngIf="isCombo(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)"
                    (onFocus)="onFocusHandler($event)">
                </uni-combo-field>
                <uni-field-set 
                    *ngIf="isFieldSet(item)" 
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)"
                    (onFocus)="onFocusHandler($event)">                    
                </uni-field-set>
                <uni-section 
                    *ngIf="isSection(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model"
                    [formConfig]="config"
                    (onReady)="onReadyHandler($event)"
                    (onChange)="onChangeHandler($event)"
                    (onToggle)="onToggleHandler($event)"
                    (onFocus)="onFocusHandler($event)">
                </uni-section>
                <uni-linebreak *ngIf="hasLineBreak(item)"></uni-linebreak>      
            </template>
            <button *ngIf="config.submitText" type="submit" [disabled]="!controls.valid">{{config.submitText}}</button>
        </form>
    `
})
export class UniForm {

    @Input()
    public config: any;

    @Input()
    public fields: UniFieldLayout[];

    @Input()
    public model: any;

    @Output()
    public onSubmit: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onToggle: EventEmitter<Object> = new EventEmitter<Object>(true);

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    @ViewChildren(UniCombo)
    public comboElements: QueryList<UniCombo>;

    @ViewChildren(UniFieldSet)
    public fieldsetElements: QueryList<UniFieldSet>;

    @ViewChildren(UniSection)
    public sectionElements: QueryList<UniSection>;

    private controls: FormGroup;
    private groupedFields: any[];

    private readyFields: number;

    private hidden: boolean = false;

    private lastFocusedComponent: UniField = null;

    @HostBinding('hidden')
    public get Hidden() {
        return this.hidden;
    }

    public set Hidden(value: boolean) {
        this.hidden = value;
    }

    public hasLineBreak(item: FieldLayout) {
        return item.LineBreak;
    }

    constructor(private builder: FormBuilder, private elementRef: ElementRef) {
    }

    public ngOnInit() {
        this.addSectionEvents();
        this.controls = this.builder.group({});
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            this.groupedFields = this.groupFields();
        }
    }

    public ngAfterViewInit() {
        this.readyFields = 0;
    }

    public onFocusHandler(event) {
        this.lastFocusedComponent = event;
        console.log(event);
    }

    public focusFirstElement() {
        const field = this.field(this.fields[0].Property);
        field.focus();
    }

    public onReadyHandler(item: UniField | UniCombo | UniFieldSet | UniSection) {
        this.readyFields++;
        if (this.readyFields === this.countElements()) {
            this.onReady.emit(this);
            this.focusFirstElement();
        }
    }

    public countElements() {
        let sections = this.sectionElements.toArray();
        let fieldsets = this.fieldsetElements.toArray();
        let combos = this.comboElements.toArray();
        let fields = this.fieldElements.toArray();
        let all = [].concat(fields, combos, fieldsets, sections);

        return all.length;
    }

    public onChangeHandler(model: any) {
        var invalids = [];
        var controls = this.controls.controls;
        for (var prop in controls) {
            if (controls.hasOwnProperty(prop)) {
                if (!controls[prop].valid) {
                    invalids.push(prop);
                }

            }
        }
        console.log(invalids.join(', '));
        this.onChange.emit(model);
    }

    public onToggleHandler(section: any) {
        this.onToggle.emit(section);
    }

    public readMode() {
        this.fieldElements.forEach((f) => f.readMode());
        this.comboElements.forEach((c) => c.readMode());
        this.fieldsetElements.forEach((fs) => fs.readMode());
        this.sectionElements.forEach((s) => s.readMode());
    }

    public editMode() {
        this.fieldElements.forEach((f) => f.editMode());
        this.comboElements.forEach((c) => c.editMode());
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

    public combo(comboId: number, fieldsetId?: number, sectionId?: number) {
        if (!sectionId && !fieldsetId) {
            let item: UniCombo[] = this.comboElements.filter((combo: UniCombo) => {
                return combo.comboId === comboId;
            });
            if (item.length > 0) {
                return item[0];
            }
            return;
        } else if (fieldsetId) {
            var fieldset: UniFieldSet = this.fieldset(fieldsetId, sectionId);
            if (fieldset) {
                let combo: UniCombo[] = fieldset.comboElements.filter((cb: UniCombo) => {
                    return cb.fieldsetId === fieldsetId;
                });
                if (combo.length > 0) {
                    return fieldset[0];
                }
            }
            return;
        } else if (sectionId) {
            var section: UniSection = this.section(sectionId);
            if (section) {
                let combo: UniCombo[] = section.comboElements.filter((cb: UniCombo) => {
                    return cb.fieldsetId === fieldsetId;
                });
                if (combo.length > 0) {
                    return combo[0];
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

        this.fields.forEach((field: UniFieldLayout) => {
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

    private addSectionEvents() {
        const target = this.elementRef.nativeElement;
        const keyUpEvent = Observable.fromEvent(target, 'keyup');
        const ctrlEvent = keyUpEvent.filter((event: KeyboardEvent) => event.ctrlKey);
        const ctrlArrow = ctrlEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.ARROW_UP || event.keyCode === KeyCodes.ARROW_DOWN;
        });

        ctrlArrow.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let nextSectionID: number;
            if (this.lastFocusedComponent === null) {
                const field: UniField = this.field(this.fields[0].Property);
                nextSectionID = field.field.Section;
            } else {
                if (event.keyCode === KeyCodes.ARROW_UP) {
                    nextSectionID = this.lastFocusedComponent.field.Section - 1;
                } else {
                    nextSectionID = this.lastFocusedComponent.field.Section + 1;
                }
                if (nextSectionID <= 0) {
                    const field: UniField = this.field(this.fields[0].Property);
                    field.focus();
                    return;
                }
            }
            const section = this.section(nextSectionID);
            if (section) {
                const fieldData = section.fields[0];
                const field = section.field(fieldData.Property);
                if (!section.isOpen) {
                    section.toggle();
                }
                setTimeout(() => {
                    field.focus();
                }, 200);

            }
        });
    };
}
