import {Component} from 'angular2/angular2';
import {UniField} from './uniField';

@Component({
    selector: 'uni-fieldset',
    inputs: ['config'],
    directives: [UniField],
    template: `<fieldset>
        <legend *ng-if="config.legend">{{config.legend}}</legend>
        <template ng-for #field [ng-for-of]="config.fields" #i="index">
            <uni-field [config]="field"></uni-field>
        </template>
    </fieldset>`,
})
export class UniFieldset {
    config;

    constructor() {
    }
}