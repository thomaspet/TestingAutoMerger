import {Component, Type} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UNI_CONTROL_TYPES} from '../controls/types';
import {UniComponentLoader} from "../core/componentLoader";
import {UniFieldBuilder} from "./uniFieldBuilder";

declare var _;

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
        return !this.isRadioGroup(type);
    }
    
    isCheckbox(type:Type) {
        return UNI_CONTROL_DIRECTIVES.indexOf(type) === 7;
    }

    hasError(field: UniFieldBuilder) {
        return field.control && field.control.touched && !field.control.valid;
    }

    buildClassString() {
        var classes = [];
        var cls = this.config.classes;
        for(var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if(_.isFunction(cls[cl])) {
                    value = cls[cl]();
                } else {
                    value = cls[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(" ");
    }
}