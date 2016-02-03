import {Component} from 'angular2/core';
import {UniComponentLoader} from '../core/componentLoader';
import {FIELD_TYPES} from './uniForm';

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniComponentLoader],
    template: `
        <article class="formSection-collapsable" [ngClass]="{'-is-open':collapsed}">
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
}