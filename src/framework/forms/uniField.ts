import {Component, Type} from 'angular2/core';

import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UNI_CONTROL_TYPES} from '../controls/types';
import {UniComponentLoader} from "../core/componentLoader";
import {UniFieldBuilder} from "./uniFieldBuilder";
import {Input} from "angular2/core";

declare var _;

@Component({
    selector: 'uni-field',
    directives: [UniComponentLoader, ShowError, UniRadioGroup, NgIf, NgForm],
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()">
            <span *ngIf="!isCheckbox()">{{getLabel()}}</span>
            <uni-component-loader [type]="getType()" [config]="getConfig()"></uni-component-loader>
            <show-error [control]="getControl()" [messages]="getErrorMessages()"></show-error>
        </label>
        <uni-radio-group *ngIf="isRadioGroup(getType())" [config]="getConfig()"></uni-radio-group>
    `
})
export class UniField {

    @Input()
    config:UniFieldBuilder;

    CONTROL_TYPES;

    constructor() {
        this.CONTROL_TYPES = UNI_CONTROL_TYPES;
    }

    getConfig() {
        return this.config;
    }

    getType() {
        return this.config.type
    }

    getLabel() {
        return this.config.label;
    }

    getControl() {
        return this.config.control;
    }

    getErrorMessages() {
        return this.config.errorMessages;
    }

    isRadioGroup(type:Type) {
        return UNI_CONTROL_DIRECTIVES.indexOf(type) === 9;
    }

    isInput() {
        return !this.isRadioGroup(this.config.type);
    }
    
    isCheckbox() {
        return UNI_CONTROL_DIRECTIVES.indexOf(this.config.type) === 7;
    }

    hasError() {
        return this.config.control && this.config.control.touched && !this.config.control.valid;
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