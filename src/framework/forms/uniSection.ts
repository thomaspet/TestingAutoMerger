import {Component} from "@angular/core";
import {UniComponentLoader} from "../core/componentLoader";
import {Input} from "@angular/core";
import {UniElementBuilder} from "./interfaces";
import {UniGenericField} from "./shared/UniGenericField";

declare var _;

/**
 * Creates a group of inputs that can be collapsed
 * It can contain UniFields and UniFieldsets
 */
@Component({
    selector: "uni-section",
    directives: [UniComponentLoader],
    template: `
        <article class="collapsable" [ngClass]="{'-is-open':config.collapsed}" [class]="buildClassString()">
            <h4 *ngIf="config.legend" (click)="toggleCollapsed()">{{config.legend}}</h4>
            <div class="collapsable-content">
                <template ngFor let-field [ngForOf]="config.fields" let i="index">
                    <uni-component-loader
                        [type]="field.fieldType"
                        [config]="field">
                    </uni-component-loader>
                </template>
            </div>
        </article>
    `
})
export class UniSection extends UniGenericField {

    /**
     * UniSection config
     */
    @Input()
    config;

    constructor() {
        super();
    }

    /**
     * open and close the group
     */
    toggleCollapsed() {
        this.config.collapsed = !this.config.collapsed;
    }
}