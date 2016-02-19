import {Component, Input} from "angular2/core";
import {UniComponentLoader} from "../core/componentLoader";
import {UniElementBuilder} from "./interfaces";
import {UniFieldsetBuilder} from "./builders/uniFieldsetBuilder";
import {UniGenericField} from "./shared/UniGenericField";

declare var _;

/**
 * Component that groups UniFields
 */
@Component({
    selector: "uni-fieldset",
    directives: [UniComponentLoader],
    template: `<fieldset [class]="buildClassString()">
        <legend *ngIf="config.legend">{{config.legend}}</legend>
        <template ngFor #field [ngForOf]="config.fields" #i="index">
            <uni-component-loader
                [type]="field.fieldType"
                [config]="field">
            </uni-component-loader>
        </template>
    </fieldset>`,
})
export class UniFieldset extends UniGenericField {
    @Input()
    config: UniFieldsetBuilder;
}
