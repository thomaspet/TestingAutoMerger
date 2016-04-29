import {Component, Input, ViewChildren, QueryList, SimpleChange, ChangeDetectionStrategy} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
import {UniField} from "../xforms/unifield";
declare var _; //lodash

@Component({
    selector: 'uni-field-set',
    template: `
        <fieldset>
            <legend *ngIf="config.legend">{{config.legend}}</legend>
            <template ngFor #field [ngForOf]="fields" #i="index">
                <uni-field
                    [controls]="controls"
                    [field]="field" 
                    [model]="model">
                </uni-field>
            </template>
        </fieldset>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, UniField],
    providers: [FORM_PROVIDERS]
})
export class UniFieldSet {

    @Input()
    public fields: FieldLayout[];

    @Input()
    public controls: ControlGroup;

    @Input()
    public model: any;

    @ViewChildren(UniField)
    public fieldElements: QueryList<UniField>;

    public fieldsetId: number;
    public sectionId: number;
    public config: any;

    constructor() { }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['fields']) {
            if (this.fields && this.fields.length > 0) {
                this.sectionId = this.fields[0].Section;
                this.fieldsetId = this.fields[0].FieldSet;
                this.config = {};
                this.config.legend = this.fields[0].Legend;
            }
        }
    }

    public getElement(property: string): UniField {
        // look after fields
        var item: UniField[] = this.fieldElements.filter((cmp: UniField) => {
            return cmp.field.Property === property;
        });
        if (item.length > 0) {
            return item[0];
        }

        // nothing found
        return;
    }
}
