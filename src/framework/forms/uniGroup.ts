import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {FIELD_TYPES} from './uniForm';

declare var _;

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniComponentLoader],
    template: `
        <article class="formSection-collapsable" [ngClass]="{'-is-open':collapsed}" [class]="buildClassString()">
            <h4 *ngIf="config.legend" (click)="collapsed = !collapsed">{{config.legend}}</h4>
            <div class="collapsable-content">
                <template ngFor #field [ngForOf]="config.fields" #i="index">
                    <uni-component-loader
                        [type]="field.fieldType"
                        [config]="field">
                    </uni-component-loader>
                </template>
            </div>
        </article>
    `
})
export class UniGroup {
    config;
    collapsed:boolean = false;
    FIELD_TYPES;
    constructor() {
        this.FIELD_TYPES = FIELD_TYPES;
    }

    ngOnInit() {
        this.collapsed = this.config.collapsed;
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