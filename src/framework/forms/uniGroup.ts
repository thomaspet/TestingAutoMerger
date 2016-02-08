import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {Input} from "angular2/core";
import {IElementBuilder} from "./interfaces";
import {UniGroupBuilder} from "./builders/uniGroupBuilder";

declare var _;

/**
 * Creates a group of inputs that can be collapsed
 * It can contain UniFields and UniFieldsets
 */
@Component({
    selector: 'uni-group',
    directives: [UniComponentLoader],
    template: `
        <article class="formSection-collapsable" [ngClass]="{'-is-open':isCollapsed()}" [class]="buildClassString()">
            <h4 *ngIf="getLegend()" (click)="toggleCollapsed()">{{getLegend()}}</h4>
            <div class="collapsable-content">
                <template ngFor #field [ngForOf]="getFields()" #i="index">
                    <uni-component-loader
                        [type]="getFieldType(field)"
                        [config]="field">
                    </uni-component-loader>
                </template>
            </div>
        </article>
    `
})
export class UniGroup {

    /**
     * UniGroup config
     */
    @Input()
    config;

    constructor() {

    }

    ngOnInit() {
    }

    /**
     * returns true if group is collapsed
     * @returns {boolean|any}
     */
    isCollapsed() {
        return this.config.collapsed;
    }

    /**
     * open and close the group
     */
    toggleCollapsed() {
        this.config.collapsed = !this.config.collapsed;
    }

    /**
     * return the legend
     *
     * @returns {string}
     */
    getLegend(): string {
        return this.config.legend;
    }

    /**
     * Returns fields
     *
     * @returns Array<IElementBuilder>
     */
    getFields(): Array<IElementBuilder> {
        return this.config.fields;
    }

    /**
     * Returns the type (IElementBuilder) of that field
     *
     * @param field
     * @returns {Type}
     */
    getFieldType(field:IElementBuilder) {
        return field.fieldType;
    }

    /**
     * It builds the string of classes after evaluate each class callback
     *
     * @returns {string}
     */
    buildClassString() {
        var classes = [];
        var cls = this.config.classes;
        for(var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if(_.isFunction(cls[cl])) {
                    value = cls[cl]();
                } else {
                    value = cls[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(" ");
    }
}