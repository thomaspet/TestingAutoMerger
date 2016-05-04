import {Component, Type, Input} from 'angular2/core';
import {NgIf, NgForm} from 'angular2/common';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from '../forms/showError';
import {UniComponentLoader} from '../core/componentLoader';
import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniGenericField} from './shared/UniGenericField';
import {UniCheckboxInput} from '../controls/checkbox/checkbox';

declare var _;

/**
 *
 */
@Component({
    selector: 'uni-field',
    directives: [UniComponentLoader, ShowError, NgIf, NgForm, UniCheckboxInput],
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()" [class.-has-linebreak]="hasLineBreak()">
            <span>{{config.label}}</span>
            <uni-component-loader [type]="config.type" [config]="config"></uni-component-loader>
            <show-error [control]="config.control" [messages]="config.errorMessages"></show-error>
        </label>
        <uni-checkbox *ngIf="isCheckbox()" [config]="config" [class.-has-linebreak]="hasLineBreak()"></uni-checkbox>
    `
})
export class UniField extends UniGenericField {

    @Input()
    public config: UniFieldBuilder;

    constructor() {
        super();
    }

    /**
     * Returns true if element should have a line break
     *
     * @returns {boolean|(function(boolean): UniFieldBuilder)}
     */
    public hasLineBreak() {
        return this.config.lineBreak;
    }

    /**
     * Returns true if this component is a RadioGroup
     * @returns {boolean}
     */
    public isRadioGroup() {
        return UNI_CONTROL_DIRECTIVES.indexOf(this.config.type) === 9;
    }

    /**
     * Return true if it isn't a RadioGroup
     * @returns {boolean}
     */
    public isInput() {
        return !this.isRadioGroup() && !this.isCheckbox();
    }

    /**
     * Return true if it is a checkbox
     * @returns {boolean}
     */
    public isCheckbox() {
        return UNI_CONTROL_DIRECTIVES.indexOf(this.config.type) === 8;
    }

    /**
     * return true if the error has errors and it has been touched
     *
     * @returns {AbstractControl|boolean}
     */
    public hasError() {
        return this.config.control && this.config.control.touched && !this.config.control.valid;
    }
}
