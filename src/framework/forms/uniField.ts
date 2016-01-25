import {Component} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UNI_CONTROL_TYPES} from '../controls/types';
@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UNI_CONTROL_DIRECTIVES, ShowError, UniRadioGroup, NgIf, NgForm],
    templateUrl: "framework/forms/uniField.html"
})
export class UniField {
    config;
    CONTROL_TYPES;
    constructor(){
        this.CONTROL_TYPES = UNI_CONTROL_TYPES;
    }

    isRadioGroup(type:number) {
        return (type === UNI_CONTROL_TYPES.RADIOGROUP);
    }

    isInput(type:number) {
        return  !this.isRadioGroup(type);
    }

    setFormValue(control,value) {
        control.updateValue(value);
    }
}