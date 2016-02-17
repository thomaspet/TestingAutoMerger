import {Component, Type, Input} from "angular2/core";
import {NgIf, NgForm} from "angular2/common";
import {UNI_CONTROL_DIRECTIVES} from "../controls";
import {ShowError} from "../forms/showError";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {UniComponentLoader} from "../core/componentLoader";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";

declare var _;

/**
 *
 */
@Component({
    selector: "uni-input",
    directives: [UniComponentLoader, ShowError, UniRadioGroup, NgIf, NgForm],
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()" [class.-has-linebreak]="hasLineBreak()">
            <span>{{getLabel()}}</span>
            <uni-component-loader [type]="getType()" [config]="getConfig()"></uni-component-loader>
            <show-error [control]="getControl()" [messages]="getErrorMessages()"></show-error>
        </label>
        <uni-radio-group *ngIf="isRadioGroup(getType())" [config]="getConfig()"></uni-radio-group>
    `
})
export class UniInput {

    @Input()
    config: UniFieldBuilder;

    constructor() {
    }

    /**
     * Returns the actual config
     *
     * @returns {UniFieldBuilder}
     */
    getConfig() {
        return this.config;
    }

    /**
     * Return type of the component
     *
     * @returns {Type}
     */
    getType() {
        return this.config.type
    }

    /**
     * Returns true if element should have a line break
     *
     * @returns {boolean|(function(boolean): UniFieldBuilder)}
     */
    hasLineBreak() {
        return this.config.lineBreak;
    }

    /**
     * Returns label
     *
     * @returns {string}
     */
    getLabel() {
        return this.config.label;
    }

    /**
     * Returns the control
     *
     * @returns {AbstractControl}
     */
    getControl() {
        return this.config.control;
    }

    /**
     * Returns error messages attached to that control
     *
     * @returns {Array<any>}
     */
    getErrorMessages() {
        return this.config.errorMessages;
    }

    /**
     * Returns true if this component is a RadioGroup
     * @param type
     * @returns {boolean}
     */
    isRadioGroup(type: Type) {
        return UNI_CONTROL_DIRECTIVES.indexOf(type) === 9;
    }

    /**
     * Return true if it isn"t a RadioGroup
     * @returns {boolean}
     */
    isInput() {
        return !this.isRadioGroup(this.config.type);
    }

    /**
     * Return true if it is a checkbox
     * @returns {boolean}
     */
    isCheckbox() {
        return UNI_CONTROL_DIRECTIVES.indexOf(this.config.type) === 7;
    }

    /**
     * return true if the error has errors and it has been touched
     *
     * @returns {AbstractControl|boolean}
     */
    hasError() {
        return this.config.control && this.config.control.touched && !this.config.control.valid;
    }

    /**
     * It builds the string of classes after evaluate each class callback
     *
     * @returns {string}
     */
    buildClassString() {
        var classes = [];
        var cls = this.config.classes;
        for (var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if (_.isFunction(cls[cl])) {
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