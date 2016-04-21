import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "angular2/common";
import {FieldLayout} from "../../app/unientities";
import {UniField} from "../xforms/unifield";
declare var _; //lodash

@Component({
    selector:'uni-field-set',
    template: `
        <fieldset>
            <legend *ngIf="config.legend">{{config.legend}}</legend>
            <template ngFor #field [ngForOf]="fields" #i="index">
                <uni-field 
                    *ngIf="isField(item)"
                    [controls]="controls"
                    [fields]="item" 
                    [model]="model">
                </uni-field>
            </template>
        </fieldset>
    `,
    directives: [FORM_DIRECTIVES, UniField],
    providers: [FORM_PROVIDERS],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniFieldSet {

    @Input()
    public fields: any;

    @Input()
    public controls: any;

    @Input()
    public model: any;

    public fieldsetId: number;
    public sectionId: number;
    public config: any;

    constructor(){}

    public ngOnChanges() {
        if(this.fields && this.fields.length > 0) {
            this.sectionId = this.fields[0].Section;
            this.fieldsetId = this.fields[0].FieldSet;
            this.config = {};
            this.config.legend = this.fields[0].Legend;
        }
    }
}
