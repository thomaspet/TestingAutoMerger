import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {Input} from "angular2/core";
import {IElementBuilder} from "./interfaces";

declare var _;

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
    config;

    constructor() {}

    hasError(field) {
        return field.control.touched && !field.control.valid;
    }

    getFields() {
        return this.config.fields;
    }

    getLegend() {
        return this.config.legend;
    }

    getFieldType(field:IElementBuilder) {
        return field.fieldType;
    }

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