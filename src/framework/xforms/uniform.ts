import {
    Component, EventEmitter, Input, Output, ViewChildren, QueryList, SimpleChange
} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
import {UniField} from "./unifield";
import {UniFieldSet} from "./unifieldset";
import {UniSection} from "./unisection";

declare var _; // lodash

/**
 * Form component that wraps form elements
 */
@Component({
    selector: "uni-form",
    directives: [FORM_DIRECTIVES, UniField, UniFieldSet, UniSection],
    providers: [FORM_PROVIDERS],
    template: `
        <form (submit)="submit($event)" [ngFormModel]="controls">
            <template ngFor #item [ngForOf]="groupedFields" #i="index">
                <uni-field 
                    *ngIf="isField(item)"
                    [controls]="controls"
                    [field]="item" 
                    [model]="model">
                </uni-field>
                <uni-field-set 
                    *ngIf="isFieldSet(item)" 
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model">                    
                </uni-field-set>
                <uni-section 
                    *ngIf="isSection(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model">                        
                </uni-section>
            </template>
            <button type="submit">{{config.submitText}}</button>
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

    private controls: ControlGroup;

    private groupedFields: any[];

    constructor(private builder: FormBuilder) {

    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        let self = this;
        if (changes['model']) {
            this.controls = this.builder.group({});
            this.controls.valueChanges.subscribe(() => {
                self.onChange.emit(self.model);
            });
        }
        if (changes['fields']) {
            this.groupedFields = this.groupFields();
        }
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    public toggleSection(id: number) {
        var item: UniSection[] = this.sectionElements.filter((section: UniSection) => {
            return section.sectionId === id;
        });
        if (item.length === 1) {
            item[0].toggle();
        }
    }

    public getElement(property: string): UniField {
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
                element = cmp.getElement(property);
            }
        });
        if (element) {
            return element;
        }

        // Look inside sections
        this.sectionElements.forEach((cmp: UniSection) => {
            if (!element) {
                element = cmp.getElement(property);
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

    private isField(field: FieldLayout): boolean {
        return !_.isArray(field) && field.Section === 0 && field.FieldSet === 0;
    }

    private isFieldSet(field: FieldLayout): boolean {
        return _.isArray(field) && field[0].Section === 0 && field.FieldSet > 0;
    }

    private isSection(field: FieldLayout): boolean {
        return _.isArray(field) && field[0].Section > 0;
    }

    private groupFields() {
        let group = [], section = [], fieldset = [];
        let lastSection = 0, lastFieldSet = 0;
        this.fields.forEach((field: FieldLayout) => {
            if (field.Section === 0 && field.FieldSet === 0) {// manage fields
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                if (field.Section !== lastSection && section.length > 0) {
                    group.push(section);
                    section = [];
                }
                lastSection = field.Section;
                lastFieldSet = field.FieldSet;
                group.push(field);
            }
            else if (field.Section === 0 && field.FieldSet > 0) {// manage fieldsets
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                lastFieldSet = field.FieldSet;
                fieldset.push(field);
            }
            else if (field.Section > 0) {// manage sections
                if (field.Section !== lastSection && section.length > 0) {
                    group.push(section);
                    section = [];
                }
                lastSection = field.Section;
                section.push(field);
            }
        });
        if (fieldset.length > 0) { // add fielsets to the last section or group
            group.push(fieldset);
        }
        if (section.length > 0) { // add section to the group
            group.push(section);
        }
        return group;
    }
}