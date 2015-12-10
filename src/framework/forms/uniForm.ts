import {Component, FORM_DIRECTIVES, FORM_PROVIDERS, Control, FormBuilder, Validators, OnInit} from 'angular2/angular2';
import {EventEmitter} from "angular2/core";
import {NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf} from 'angular2/common';
import {isArray} from 'angular2/src/facade/lang';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {ShowError} from "../forms_old/showError";

//import {ShowError} from "./showError";

declare var _;

export enum FIELD_TYPES {
    FIELD,
    FIELDSET,
    GROUP
}

@Component({
    selector: 'uni-field',
    inputs: ['config'],
    directives: [UNI_CONTROL_DIRECTIVES, ShowError],
    templateUrl: "framework/forms/uniField.html"
})
export class UniField {
    config;
}

@Component({
    selector: 'uni-fieldset',
    inputs: ['config'],
    directives: [UniField],
    template: `<fieldset>
        <legend *ng-if="config.legend">{{config.legend}}</legend>
        <template ng-for #field [ng-for-of]="config.fields" #i="index">
            <uni-field [config]="field"></uni-field>
        </template>
    </fieldset>`,
})
export class UniFieldset {
    config;

    constructor() {
    }
}

@Component({
    selector: 'uni-group',
    inputs: ['config'],
    directives: [UniField, UniFieldset],
    template: `
        <article class="formSection-collapsable" [ng-class]="{'-is-open':collapsed}">
            <h4 *ng-if="config.title" (click)="collapsed = !collapsed">{{config.title}}</h4>
            <div class="collapsable-content">
                <template ng-for #field [ng-for-of]="config.fields" #i="index">
                    <template [ng-if]="field.fieldType === FIELD_TYPES.FIELD">
                        <uni-field [config]="field"></uni-field>
                    </template>
                    <template [ng-if]="field.fieldType === FIELD_TYPES.FIELDSET">
                        <uni-fieldset [config]="field"></uni-fieldset>
                    </template>
                </template>
            </div>
        </article>
    `
})
export class UniGroup {
    config;
    collapsed:boolean = false;
    FIELD_TYPES;
    constructor() {
        this.FIELD_TYPES = FIELD_TYPES;
    }
}

@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, NgSwitchWhen, NgSwitch, NgSwitchDefault, NgIf, UniFieldset, UniGroup, UniField],
    providers: [FORM_PROVIDERS],
    inputs: ['fields'],
    outputs: ['uniFormSubmit'],
    template: `
        <form (submit)="onSubmit(form)" no-validate [ng-form-model]="form">
            <template ng-for #field [ng-for-of]="fields" #i="index">
                <template [ng-if]="field.fieldType === FIELD_TYPES.FIELD">
                    <uni-field [config]="field"></uni-field>
                </template>
                <template [ng-if]="field.fieldType === FIELD_TYPES.FIELDSET">
                    <uni-fieldset [config]="field"></uni-fieldset>
                </template>
                <template [ng-if]="field.fieldType === FIELD_TYPES.GROUP">
                    <uni-group [config]="field"></uni-group>
                </template>
            </template>

            <button type="submit" [disabled]="!form.valid">submit</button>
        </form>
    `
})
export class UniForm {

    private form;
    private fields;
    private uniFormSubmit:EventEmitter<any> = new EventEmitter<any>(true);
    private FIELD_TYPES;
    private fbControls = {};

    constructor(public fb:FormBuilder) {
        this.FIELD_TYPES = FIELD_TYPES;
    }

    onSubmit(form) {
        this.updateModel(this.fields, form.value);
        this.uniFormSubmit.emit(form);
        return false;
    }

    ngOnInit() {
        this.form = this.extendFields(this.fields);
    }

    private updateModel(config, formValue) {
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            switch (field.fieldType) {
                case FIELD_TYPES.FIELD:
                    var model = field.model;
                    var fieldPath = field.field;
                    var value = _.get(formValue, fieldPath);
                    _.set(model, fieldPath, value);
                    break;

                default:
                    this.updateModel(field.fields, formValue);
                    break;
            }
        }
    }

    private extendFields(config) {
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            switch (field.fieldType) {
                case FIELD_TYPES.FIELD:
                    this.extendField(field);
                    this.fbControls[field.field] = field.control;
                    break;

                default:
                    this.extendFields(field.fields);
                    break;
            }
        }
        return this.fb.group(this.fbControls);
    }

    private extendField(c) {
        let syncValidators = this.composeSyncValidators(c);
        let asyncValidators = this.composeAsyncValidators(c);
        let messages = this.composeMessages(c);
        let controlArgs = [_.get(c.model,c.field), syncValidators, asyncValidators];
        let control = new (Function.prototype.bind.apply(Control, [null].concat(controlArgs)));

        c.control = control;
        c.errorMessages = messages;
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
        if (validators && isArray(validators)) {
            validators.forEach((validator)=> {
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
        if (validators && isArray(validators)) {
            validators.forEach((validator)=> {
                list[validator.name] = validator.message;
            });
        }
    }
}