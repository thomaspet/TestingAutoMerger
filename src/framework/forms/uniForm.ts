import {Component, OnInit ,EventEmitter, Input, Output} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, Control, ControlGroup, FormBuilder} from "angular2/common";
import {UNI_CONTROL_DIRECTIVES} from "../controls";
import {UniRadioGroup} from "../controls/radioGroup/uniRadioGroup";
import {ShowError} from "./showError";
import {UniField} from "./uniField";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";
import {UniFieldset} from "./uniFieldset";
import {UniSection} from "./uniSection";
import {UniComboField} from "./uniComboField";
import {UniComponentLoader} from "../core/componentLoader";
import {MessageComposer} from "./composers/messageComposer";
import {ValidatorsComposer} from "./composers/validatorsComposer";
import {ControlBuilder} from "./builders/controlBuilder";
import {UniElementBuilder} from "./interfaces";
import {UniFormBuilder} from "./builders/uniFormBuilder";
import {UniGenericField} from "./shared/UniGenericField";

declare var _; //lodash

/**
 * Form component that wraps form elements
 */
@Component({
    selector: "uni-form",
    directives: [FORM_DIRECTIVES, UniField, UniFieldset, UniSection, UniComboField, UniComponentLoader],
    providers: [FORM_PROVIDERS],
    template: `
        <form (submit)="submit()" [ngFormModel]="form" [class]="buildClassString()" [class.error]="hasErrors()">
            <template ngFor #field [ngForOf]="getFields()" #i="index">
                <uni-component-loader
                    [type]="field.fieldType"
                    [config]="field">
                </uni-component-loader>
            </template>
            <button type="submit" [disabled]="hasErrors()" [hidden]="isSubmitButtonHidden()">{{submitText}}</button>
        </form>
    `
})
export class UniForm extends UniGenericField implements OnInit {

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
    uniFormSubmit: EventEmitter<any> = new EventEmitter<any>(true);

    /**
     * Angular2 FormGroup used to validate each input (See FormBuilder and ControlGroup in Angular2 Docs)
     */
    form: ControlGroup;

    /**
     * Text displayed in the submit button
     * @type {string}
     */
    submitText: string = "submit";

    /**
     * Object that contains each Angualar2 form control (see AbstractControl in Angular2 Docs)
     * @type {{}}
     */
    controls = {};

    /**
     *
     * @param fb
     */
    constructor(public fb: FormBuilder) {
        super();
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
     * return form value
     *
     * @returns {any}
     */
    getValue() {
        return this.form.value;
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
     * @returns {UniElementBuilderCollection}
     */
    getFields() {
        return this.config.fields;
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
     * updates the model with a new instance
     *
     * @param new instance of model
     * @param config Form Config
     * @param formValue Form value
     */
    refresh(newModel, config?, formValue?) {
        var config = config || this.config.fields;
        var formValue = formValue || this.form.value;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                field.model = newModel;
                var fieldPath = field.field;
                var value = _.get(newModel, fieldPath);
                field.refresh(value);
            } else {
                this.refresh(newModel, field.fields, formValue);
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