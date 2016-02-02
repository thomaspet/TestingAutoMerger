import {Component} from 'angular2/core';
import {UniField} from './uniField';
import {UniFieldset} from './uniFieldset';
import {UniCombo} from './uniCombo';
import {FIELD_TYPES} from './uniForm';

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniField, UniFieldset, UniCombo],
    template: `
        <article class="formSection-collapsable" [ngClass]="{'-is-open':collapsed}">
            <h4 *ngIf="config.legend" (click)="collapsed = !collapsed">{{config.legend}}</h4>
            <div class="collapsable-content">
                <template ngFor #field [ngForOf]="config.fields" #i="index">
                    <template [ngIf]="field.fieldType === FIELD_TYPES.FIELD">
                        <uni-field [config]="field" [ngClasses]="config.classes" [class.error]="hasError(field)"></uni-field>
                    </template>
                    <template [ngIf]="field.fieldType === FIELD_TYPES.FIELDSET">
                        <uni-fieldset [config]="field"></uni-fieldset>
                    </template>
                    <template [ngIf]="field.fieldType === FIELD_TYPES.COMBO">
                        <uni-combo [config]="field"></uni-combo>
                    </template>
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
    hasError(field) {
        return field.control.touched && !field.control.valid;
    }
}