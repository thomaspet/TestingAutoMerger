import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {Input} from "angular2/core";
import {IElementBuilder} from "./interfaces";
import {UniFieldsetBuilder} from "./builders/uniFieldsetBuilder";

declare var _;

/**
 * Component that groups UniFields
 */
@Component({
    selector: 'uni-fieldset',
    directives: [UniComponentLoader],
    template: `<fieldset [class]="buildClassString()">
        <legend *ngIf="getLegend()">{{getLegend()}}</legend>
        <template ngFor #field [ngForOf]="getFields()" #i="index">
            <uni-component-loader
                [type]="getFieldType(field)"
                [config]="field">
            </uni-component-loader>
        </template>
    </fieldset>`,
})
export class UniFieldset {

    @Input()
    config: UniFieldsetBuilder;

    constructor() {}

    /**
     * Return true if the control of this field is invalid
     *
     * @param field
     * @returns {boolean}
     */
    hasError(field) {
        return field.control.touched && !field.control.valid;
    }

    /**
     * Returns fields
     *
     * @returns Array<IElementBuilder>
     */
    getFields() {
        return this.config.fields;
    }

    /**
     * return the legend
     *
     * @returns {string}
     */
    getLegend() {
        return this.config.legend;
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