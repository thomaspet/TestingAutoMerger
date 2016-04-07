import {Component, OnInit, EventEmitter, Input, Output} from "angular2/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "angular2/common";
import {UniField} from "./uniField";
import {UniFieldBuilder} from "./builders/uniFieldBuilder";
import {UniFieldset} from "./uniFieldset";
import {UniSection} from "./uniSection";
import {UniComboField} from "./uniComboField";
import {UniComponentLoader} from "../core/componentLoader";
import {MessageComposer} from "./composers/messageComposer";
import {ValidatorsComposer} from "./composers/validatorsComposer";
import {ControlBuilder} from "./builders/controlBuilder";
import {UniFormBuilder} from "./builders/uniFormBuilder";
import {UniGenericField} from "./shared/UniGenericField";
import {UniElementBuilder} from "./interfaces";

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
            <button *ngIf="!isSubmitButtonHidden()" type="submit" [disabled]="hasErrors()">{{submitText}}</button>
        </form>
    `
})
export class UniForm extends UniGenericField implements OnInit {

    /**
     * Configuration of the form
     */
    @Input()
    public config: UniFormBuilder;

    /**
     * Object use to emit values to other components
     * @type {EventEmitter<any>}
     */
    @Output()
    public uniFormSubmit: EventEmitter<any> = new EventEmitter<any>(true);

    /**
     * Angular2 FormGroup used to validate each input
     * (See FormBuilder and ControlGroup in Angular2 Docs)
     */
    public form: ControlGroup;

    /**
     * Text displayed in the submit button
     * @type {string}
     */
    public submitText: string = 'submit';

    /**
     * Object that contains each Angualar2 form control (see AbstractControl in Angular2 Docs)
     * @type {{}}
     */
    public controls: any = {};

    /**
     * number of fields in the form
     * @type {number}
     */
    public numberOfFields: number = -1;

    /**
     * number of fields that have executed ngAfterViewInit
     * @type {number}
     */
    public readyFields: number = 0;

    /**
     * Emits the form when all fields are ready
     * @type {EventEmitter<any>}
     */
    public isDomReady: EventEmitter<any> = new EventEmitter<any>(true);

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
    public ngOnInit() {
        this.createFormControls(this.config.fields);
        this.form = this.fb.group(this.controls);
    }

    public ngAfterViewInit() {
        this.getNumberOfFields(this.config.fields);
        this.subscribeToDomIsReady(this.config.fields);
    }

    public subscribeToDomIsReady(fields) {
        var self = this;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (field instanceof UniFieldBuilder) {
                field.isDomReady.subscribe(
                    ()=> {
                        self.readyFields++;
                        if (self.numberOfFields === self.readyFields) {
                            self.isDomReady.emit(self);
                        }
                    }, (error) => console.error("UniForm -> IsDomReadyError:", error));
            } else {
                this.subscribeToDomIsReady(field.fields);
            }
        }
    }

    /**
     * It updates the model and emit the value of the form
     * @returns {boolean}
     */
    public submit(): boolean {
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
    public getEventEmitter() {
        return this.uniFormSubmit;
    }

    /**
     * return form value
     *
     * @returns {any}
     */
    public getValue() {
        return this.form.value;
    }

    /**
     * returns true is submit button should be hidden
     * @returns {boolean}
     */
    public isSubmitButtonHidden() {
        return this.config.isSubmitButtonHidden;
    }

    /**
     * returns true if form has any error
     * @returns {boolean}
     */
    public hasErrors() {
        return !this.form.valid;
    }

    /**
     * return all fields inside the form
     * @returns {UniElementBuilderCollection}
     */
    public getFields() {
        return this.config.fields;
    }

    /**
     * Updates the model
     *
     * @param config Form Config
     * @param formValue Form value
     */
    public updateModel(config?: any, formValue?: any) {
        config = config || this.config.fields;
        formValue = formValue || this.form.value;

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
    public refresh(newModel, config?, formValue?) {
        config = config || this.config.fields;
        formValue = formValue || this.form.value;

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

    getState() {
        var self = this;
        return {
            value: self.form.value
        };
    }

    setState(formValue) {
        var self = this;
        return this.isDomReady.subscribe((cmp: UniForm) => {
            cmp.updateModel(null, formValue);
            var field: UniFieldBuilder = <UniFieldBuilder>self.config.fields[0];
            cmp.refresh(field.model);
            return cmp;
        });
    };

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

    private getNumberOfFields(fields): number {
        if (this.numberOfFields >= 0) {
            return this.numberOfFields;
        }
        var nfields = 0;

        for (let i = 0; i < fields.length; i++) {
            if (fields[i] instanceof UniFieldBuilder) {
                nfields++;
            } else {
                this.getNumberOfFields(fields[i].fields);
            }
        }

        this.numberOfFields = nfields;
        return nfields;
    }
}