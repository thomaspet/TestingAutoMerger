import {Component} from 'angular2/core';
import {UniField} from './uniField';
import {UniFieldset} from './uniFieldset';
import {FIELD_TYPES} from './uniForm';

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniField, UniFieldset],
    template: `
        <article class="formSection-collapsable" [ngClass]="{'-is-open':collapsed}">
            <h4 *ngIf="config.title" (click)="collapsed = !collapsed">{{config.title}}</h4>
            <div class="collapsable-content">
                <template ngFor #field [ngForOf]="config.fields" #i="index">
                    <template [ngIf]="field.fieldType === FIELD_TYPES.FIELD">
                        <uni-field [config]="field"></uni-field>
                    </template>
                    <template [ngIf]="field.fieldType === FIELD_TYPES.FIELDSET">
                        <uni-fieldset [config]="field"></uni-fieldset>
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
}