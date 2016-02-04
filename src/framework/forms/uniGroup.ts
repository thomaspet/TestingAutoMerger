import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {FIELD_TYPES} from './uniForm';
import {Input} from "angular2/core";
import {IElementBuilder} from "./interfaces";

declare var _;

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
    @Input()
    config;

    constructor() {

    }

    ngOnInit() {
    }

    isCollapsed() {
        return this.config.collapsed;
    }

    toggleCollapsed() {
        this.config.collapsed = !this.config.collapsed;
    }

    getLegend() {
        return this.config.legend;
    }

    getFiels() {
        return this.config.fields;
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