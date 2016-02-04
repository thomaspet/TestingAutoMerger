import {Component, OnInit ,EventEmitter, Input} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, Control, FormBuilder, Validators} from "angular2/common";
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {ShowError} from "./showError";
import {UniField} from './uniField';
import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldset} from './uniFieldset';
import {UniGroup} from './uniGroup';
import {UniComponentLoader} from "../core/componentLoader";

declare var _;

export enum FIELD_TYPES {
    FIELD,
    FIELDSET,
    GROUP
}

@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, UniField, UniFieldset, UniGroup, UniComponentLoader],
    providers: [FORM_PROVIDERS],
    inputs: ['config'],
    outputs: ['uniFormSubmit'],
    template: `
        <form (submit)="submit()" [ngFormModel]="form" [class]="buildClassString()">
            <template ngFor #field [ngForOf]="config.fields" #i="index">
                <uni-component-loader
                    [type]="field.fieldType"
                    [config]="field">
                </uni-component-loader>
            </template>
            <button type="submit" [disabled]="!form.valid" [hidden]="config.isSubmitButtonHidden">submit</button>
        </form>
    `
})
export class UniForm {

    form;
    @Input() config;
    uniFormSubmit:EventEmitter<any> = new EventEmitter<any>(true);
    fbControls = {};

    constructor(public fb:FormBuilder) {
    }

    getSubmitEvent() {
        return this.uniFormSubmit;
    }

    submit() {
        this.updateModel(this.config.fields, this.form.value);
        this.uniFormSubmit.emit(this.form);
        return false;
    }

    ngOnInit() {
        this.form = this.createFormControlsAndAddValidators(this.config.fields);
    }

    hasError(field) {
        return field && field.control && field.control.touched && !field.control.valid;
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

    updateModel(config?, formValue?) {
        var config = config || this.config.fields;
        var formValue = formValue || this.form.value;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                var model = field.model;
                var fieldPath = field.field;
                var value = _.get(formValue, fieldPath);
                _.set(model, fieldPath, value);
            } else {
                this.updateModel(field.fields, formValue);
            }
        }
    }

    private createFormControlsAndAddValidators(config) {
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                this.createFormControlAndAddValidators(field);
                this.fbControls[field.field] = field.control;
            } else {
                this.createFormControlsAndAddValidators(field.fields);
            }
        }
        return this.fb.group(this.fbControls);
    }

    private createFormControlAndAddValidators(c) {
        let syncValidators = this.composeSyncValidators(c);
        let asyncValidators = this.composeAsyncValidators(c);
        let messages = this.composeMessages(c);
        let control = new Control("", syncValidators, asyncValidators);
        control.updateValue(_.get(c.model,c.field),{
            onlySelf: false,
            emitEvent: false,
            emitModelToViewChange: true
        });
        c.control = control;
        c.errorMessages = messages;
        //c.classes.error = c.control.touched && !c.control.valid;
    }

    private composeSyncValidators(c) {
        let validators = this.joinValidators(c.syncValidators);
        return Validators.compose(validators);
    }

    private composeAsyncValidators(c) {
        let validators = this.joinValidators(c.asyncValidators);
        return Validators.composeAsync(validators);
    }

    private joinValidators(validators) {
        let list = [];
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator:any)=> {
                list.push(validator.validator);

            });
        }
        return list;
    }

    private composeMessages(c) {
        let messages = {};
        this.assignMessages(c.asyncValidators, messages);
        this.assignMessages(c.syncValidators, messages);
        return messages;
    }

    private assignMessages(validators, list) {
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator:any)=> {
                list[validator.name] = validator.message;
            });
        }
    }
}