import {Component} from 'angular2/angular2';
import {UniField} from './uniField';
import {UniFieldset} from './uniFieldset';
import {FIELD_TYPES} from './uniForm';

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniField, UniFieldset],
    template: `
        <article class="formSection-collapsable" [ng-class]="{'-is-open':collapsed}">
            <h4 *ng-if="config.title" (click)="collapsed = !collapsed">{{config.title}}</h4>
            <div class="collapsable-content">
                <template ng-for #field [ng-for-of]="config.fields" #i="index">
                    <template [ng-if]="field.fieldType === FIELD_TYPES.FIELD">
                        <uni-field [config]="field"></uni-field>
                    </template>
                    <template [ng-if]="field.fieldType === FIELD_TYPES.FIELDSET">
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