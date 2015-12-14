import {Component} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";

@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UNI_CONTROL_DIRECTIVES, ShowError, UniRadioGroup, NgIf, NgForm],
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

    setFormValue(control,value) {
        control.updateValue(value);
    }
}