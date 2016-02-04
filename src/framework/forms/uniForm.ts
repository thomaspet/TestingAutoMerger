import {Component, OnInit ,EventEmitter, Input, Output} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, Control, ControlGroup, FormBuilder} from "angular2/common";
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {ShowError} from "./showError";
import {UniField} from './uniField';
import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldset} from './uniFieldset';
import {UniGroup} from './uniGroup';
import {UniComponentLoader} from "../core/componentLoader";
import {MessageComposer} from "./messageComposer";
import {ValidatorsComposer} from "./validatorsComposer";
import {ControlBuilder} from "./controlBuilder";

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
    template: `
        <form (submit)="submit()" [ngFormModel]="form" [class]="buildClassString()" [class.error]="hasErrors()">
            <template ngFor #field [ngForOf]="config.fields" #i="index">
                <uni-component-loader
                    [type]="field.fieldType"
                    [config]="field">
                </uni-component-loader>
            </template>
            <button type="submit" [disabled]="hasErrors()" [hidden]="isSubmitButtonHidden()">{{submitText}}</button>
        </form>
    `
})
export class UniForm implements OnInit {

    @Input()
    config;

    @Output()
    uniFormSubmit:EventEmitter<any> = new EventEmitter<any>(true);

    form: ControlGroup;
    submitText:string = 'submit';
    controls = {};

    constructor(public fb:FormBuilder) {
    }

    ngOnInit() {
        this.createFormControls(this.config.fields);
        this.form = this.fb.group(this.controls);
    }

    submit() {
        this.updateModel(this.config.fields, this.form.value);
        this.uniFormSubmit.emit(this.form);
        return false;
    }

    getEventEmitter() {
        return this.uniFormSubmit;
    }

    isSubmitButtonHidden() {
        return this.config.isSubmitButtonHidden;
    }

    hasErrors() {
        return !this.form.valid;
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

    private createFormControls(config) {
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                this.createFormControl(field);
            } else {
                this.createFormControls(field.fields);
            }
        }
    }

    private createFormControl(config) {
        config.errorMessages = MessageComposer.composeMessages(config);

        config.control = ControlBuilder.build(
            config,
            ValidatorsComposer.composeSyncValidators(config),
            ValidatorsComposer.composeAsyncValidators(config)
        );

        this.controls[config.field] = config.control;
    }
}