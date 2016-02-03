import {Component, Type} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UNI_CONTROL_TYPES} from '../controls/types';
import {UniComponentLoader} from "../core/componentLoader";
import {UniFieldBuilder} from "./uniFieldBuilder";

@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UniComponentLoader, ShowError, UniRadioGroup, NgIf, NgForm],
    templateUrl: "framework/forms/uniField.html"
})
export class UniField {
    config;
    CONTROL_TYPES;
    constructor() {
        this.CONTROL_TYPES = UNI_CONTROL_TYPES;
    }

    isRadioGroup(type:Type) {
        return UNI_CONTROL_DIRECTIVES.indexOf(type) === 9;
    }

    isInput(type:Type) {
        return  !this.isRadioGroup(type);
    }

    hasError(field: UniFieldBuilder) {
        return field.control && field.control.touched && !field.control.valid;
    }
}