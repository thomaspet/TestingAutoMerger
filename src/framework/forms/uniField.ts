import {Component} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UNI_CONTROL_TYPES} from '../controls/types';
import {UniComponentLoader} from "../core/componentLoader";

@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UniComponentLoader, ShowError, UniRadioGroup, NgIf, NgForm],
    templateUrl: "framework/forms/uniField.html"
})
export class UniField {
    config;
    CONTROL_TYPES;
    constructor(){
        this.CONTROL_TYPES = UNI_CONTROL_TYPES;
    }

    isRadioGroup(type:number) {
        return false
    }

    isInput(type:number) {
        return  true
    }
}