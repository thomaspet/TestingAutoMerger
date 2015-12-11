import {Component} from 'angular2/angular2';

import {NgIf} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms_old/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";

@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UNI_CONTROL_DIRECTIVES, ShowError, UniRadioGroup, NgIf],
    templateUrl: "framework/forms/uniField.html"
})
export class UniField {
    config;
    constructor(){}

    isRadioGroup(type:string) {
        return (type === 'radio');
    }

    isInput(type:string) {
        return  !this.isRadioGroup(type);
    }
}