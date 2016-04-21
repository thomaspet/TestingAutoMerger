import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
import {UniField} from "../xforms/unifield";
import {UniFieldSet} from "../xforms/unifieldset";
declare var _; //lodash

@Component({
    selector:'uni-section',
    template: `
        <article class="collapsable" [ngClass]="{'-is-open':isOpen}">
            <h4 *ngIf="config.legend" (click)="toggle()">{{config.legend}}</h4>
            <div class="collapsable-content">
                <template ngFor #item [ngForOf]="groupedFields" #i="index">
                    <uni-field 
                        *ngIf="isField(item)"
                        [controls]="controls"
                        [fields]="item" 
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
    directives: [FORM_DIRECTIVES, UniField,UniFieldSet],
    providers: [FORM_PROVIDERS],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSection {
    @Input()
    public fields: any;

    @Input()
    public controls: any;

    @Input()
    public model: any;

    public sectionId: number;
    private groupedFields: any;
    private config: any = {};
    public isOpen: boolean = false;
    constructor(){}

    public ngOnChanges() {
        if(this.fields && this.fields.length > 0) {
            this.sectionId = this.fields[0].Section;
            this.config.legend = this.fields[0].Legend;

        }
        this.groupedFields = this.groupFields();
    }

    public toggle() {
        this.isOpen = !this.isOpen;
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
            if (field.FieldSet === 0) {//manage fields
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                lastFieldSet = field.FieldSet;
                group.push(field);
            }
            else if (field.FieldSet > 0) {//manage fieldsets
                if (field.FieldSet !== lastFieldSet && fieldset.length > 0) {
                    group.push(fieldset);
                    fieldset = [];
                }
                lastFieldSet = field.FieldSet;
                fieldset.push(field);
            }
        });
        if (fieldset.length > 0) { //add fielsets to the last group
            group.push(fieldset);
        }
        return group;
    }
}
