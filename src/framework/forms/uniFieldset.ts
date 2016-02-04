import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';

declare var _;

@Component({
    selector: 'uni-fieldset',
    inputs: ['config'],
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
export class UniFieldset {
    config;

    constructor() {
    }
    hasError(field) {
        return field.control.touched && !field.control.valid;
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