import {Component, Input, QueryList, ViewChildren, ChangeDetectorRef, ChangeDetectionStrategy, SimpleChange} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
import {UniField} from "../xforms/unifield";
import {UniFieldSet} from "../xforms/unifieldset";
declare var _; //lodash

@Component({
    selector: 'uni-section',
    template: `
        <article class="collapsable" [ngClass]="{'-is-open':isOpen}">
            <h4 *ngIf="config.legend" (click)="toggle()">{{config.legend}}</h4>
            <div class="collapsable-content">
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
                </template>
            </div>
        </article>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, UniField, UniFieldSet],
    providers: [FORM_PROVIDERS]
})
export class UniSection {
    @Input()
    public fields: FieldLayout[];

    @Input()
    public controls: ControlGroup;

    @Input()
    public model: any;

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    @ViewChildren(UniField)
    public fieldsetElements: QueryList<UniFieldSet>;

    public sectionId: number;
    private groupedFields: any;
    private config: any = {};
    public isOpen: boolean = false;
    constructor(private cd: ChangeDetectorRef) { }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.config.legend = this.fields[0].Legend;

            }
            this.groupedFields = this.groupFields();
        }
    }

    public toggle() {
        this.isOpen = !this.isOpen;
        this.cd.markForCheck();
    }

    private isField(field: FieldLayout): boolean {
        return !_.isArray(field);
    }

    private isFieldSet(field: FieldLayout): boolean {
        return _.isArray(field);
    }

    private groupFields() {
        let group = [], fieldset = [];
        let lastFieldSet = 0;
        this.fields.forEach((field: FieldLayout) => {
            if (field.FieldSet === 0) {// manage fields
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                lastFieldSet = field.FieldSet;
                group.push(field);
            }
            else if (field.FieldSet > 0) {// manage fieldsets
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                lastFieldSet = field.FieldSet;
                fieldset.push(field);
            }
        });
        if (fieldset.length > 0) { // add fielsets to the last group
            group.push(fieldset);
        }
        return group;
    }

    public getElement(property: string) {
        // look into top lever fields
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

        return;
    }
}
