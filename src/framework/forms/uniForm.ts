import {Component, OnInit ,EventEmitter, Input, Output} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, Control, ControlGroup, FormBuilder} from "angular2/common";
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {ShowError} from "./showError";
import {UniField} from './uniField';
import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldset} from './uniFieldset';
import {UniGroup} from './uniGroup';
import {UniComponentLoader} from "../core/componentLoader";
import {MessageComposer} from "./composers/messageComposer";
import {ValidatorsComposer} from "./composers/validatorsComposer";
import {ControlBuilder} from "./builders/controlBuilder";
import {IElementBuilder} from "./interfaces";
import {UniFormBuilder} from "./builders/uniFormBuilder";

declare var _; //lodash

/**
 * Form component that wraps form elements
 */
@Component({
    selector: 'uni-form',
    directives: [FORM_DIRECTIVES, UniField, UniFieldset, UniGroup, UniComponentLoader],
    providers: [FORM_PROVIDERS],
    template: `
        <form (submit)="submit()" [ngFormModel]="form" [class]="buildClassString()" [class.error]="hasErrors()">
            <template ngFor #field [ngForOf]="getFields()" #i="index">
                <uni-component-loader
                    [type]="getFieldType(field)"
                    [config]="field">
                </uni-component-loader>
            </template>
            <button type="submit" [disabled]="hasErrors()" [hidden]="isSubmitButtonHidden()">{{submitText}}</button>
        </form>
    `
})
export class UniForm implements OnInit {

    /**
     * Configuration of the form
     */
    @Input()
    config: UniFormBuilder;

    /**
     * Object use to emit values to other components
     * @type {EventEmitter<any>}
     */
    @Output()
    uniFormSubmit:EventEmitter<any> = new EventEmitter<any>(true);

    /**
     * Angular2 FormGroup used to validate each input (See FormBuilder and ControlGroup in Angular2 Docs)
     */
    form: ControlGroup;

    /**
     * Text displayed in the submit button
     * @type {string}
     */
    submitText:string = 'submit';

    /**
     * Object that contains each Angualar2 form control (see AbstractControl in Angular2 Docs)
     * @type {{}}
     */
    controls = {};

    /**
     *
     * @param fb
     */
    constructor(public fb:FormBuilder) {
    }

    /**
     * Initialize the angular2 form builder UniForm uses to validate inputs
     */
    ngOnInit() {
        this.createFormControls(this.config.fields);
        this.form = this.fb.group(this.controls);
    }

    /**
     * It updates the model and emit the value of the form
     * @returns {boolean}
     */
    submit(): boolean {
        this.updateModel(this.config.fields, this.form.value);
        this.uniFormSubmit.emit(this.form);
        return false;
    }

    /**
     * Inteface to get the event emitter
     * It helps developer to manage form behaviour
     *
     * @returns {EventEmitter<any>}
     */
    getEventEmitter() {
        return this.uniFormSubmit;
    }

    /**
     * returns true is submit button should be hidden
     * @returns {boolean}
     */
    isSubmitButtonHidden() {
        return this.config.isSubmitButtonHidden;
    }

    /**
     * returns true if form has any error
     * @returns {boolean}
     */
    hasErrors() {
        return !this.form.valid;
    }

    /**
     * return all fields inside the form
     * @returns {IElementBuilderCollection}
     */
    getFields() {
        return this.config.fields;
    }

    /**
     * return the type of the Element return IElmementBuilder Type (UniField, UniFieldBuilder, UniGroup)
     * @param field
     * @returns {Type}
     */
    getFieldType(field:IElementBuilder) {
        return field.fieldType;
    }

    /**
     * Check the value of each property in the classes and builds the string value it should be showed
     * @returns {string}
     */
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

    /**
     * Updates the model
     *
     * @param config Form Config
     * @param formValue Form value
     */
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

    /**
     * Updates the model
     *
     * @param config Form Config
     * @param formValue Form value
     */
    refresh(config?, formValue?) {
        var config = config || this.config.fields;
        var formValue = formValue || this.form.value;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                var model = field.model;
                var fieldPath = field.field;
                var value = _.get(model, fieldPath);
                field.refreshField(value);
            } else {
                this.refresh(field.fields, formValue);
            }
        }
    }

    /**
     * Creates form controls
     *
     * @param config
     */
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

    /**
     * Composes error messages and validators
     *
     * @param config
     */
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