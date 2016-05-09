import {Component, OnInit, EventEmitter, Input, Output} from "@angular/core";
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, FormBuilder} from "@angular/common";
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
        <form (submit)="doSubmit()" [ngFormModel]="form" [class]="buildClassString()" [class.error]="hasErrors()">
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

    @Input()
    public config: UniFormBuilder;

    @Output()
    public submit: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public ready: EventEmitter<any> = new EventEmitter<any>(true);

    public form: ControlGroup;

    public submitText: string = 'submit';

    public controls: any = {};

    public numberOfFields: number = -1;

    public readyFields: number = 0;

    public get Value() {
        return this.form.value;
    }

    public set Value(value: any) {
        this._updateFormValues(value);
    }

    public get Model() {
        return this._getModel();
    }

    public set Model(model: any) {
        this._setModel(model);
    }

    constructor(public fb: FormBuilder) {
        super();
    }

    public ngOnInit() {
        this._createFormControls(this.config.fields);
        this.form = this.fb.group(this.controls);
    }

    public ngAfterViewInit() {
        this._getNumberOfFields(this.config.fields);
        this._areAllFieldsReady(this.config.fields);
    }

    public find(propertyName: string) {
        var configField: UniFieldBuilder = this.config.find(propertyName);
        if (configField) {
            return configField.fieldComponent;
        }
    }

    public onChanges() {
        return this.form.valueChanges;
    }

    public hideSubmitButton() {
        this.config.isSubmitButtonHidden = true;
    }

    public showSubmitButton() {
        this.config.isSubmitButtonHidden = false;
    }

    public isSubmitButtonHidden() {
        return this.config.isSubmitButtonHidden;
    }

    public hasErrors() {
        return !this.form.valid;
    }

    public getFields() {
        return this.config.fields;
    }

    public sync() {
        this._sync(this.form.value,this.config.fields);
    }

    private _sync(formValue?: any, config?: any) {
        config = config || this.config.fields;
        formValue = formValue || this.form.value;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                var model = field.model;
                var fieldPath = field.field;
                var value = _.get(formValue, fieldPath);
                _.set(model, fieldPath, value);
                field.refresh(value);
            } else {
                this._sync(field.fields, formValue);
            }
        }
    }

    private _getModel() {
        var config = this.config.fields;
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                return field.model;
            }
        }
        return undefined;
    }

    private _setModel(newModel, config?) {
        config = config || this.config.fields;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                field.model = newModel;
                var fieldPath = field.field;
                var value = _.get(newModel, fieldPath);
                field.refresh(value);
            } else {
                this._setModel(newModel, field.fields);
            }
        }
    }

    private _updateFormValues(formValue?: any, config?: any) {
        config = config || this.config.fields;
        formValue = formValue || this.form.value;

        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                var fieldPath = field.field;
                var value = _.get(formValue, fieldPath);
                field.refresh(value);
            } else {
                this._updateFormValues(field.fields, formValue);
            }
        }
    }

    private _areAllFieldsReady(fields) {
        var self = this;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            if (field instanceof UniFieldBuilder) {
                field.ready.subscribe(
                    ()=> {
                        self.readyFields++;
                        if (self.numberOfFields === self.readyFields) {
                            self.ready.emit(self);
                        }
                    }, (error) => console.error("UniForm -> IsDomReadyError:", error));
            } else {
                this._areAllFieldsReady(field.fields);
            }
        }
    }

    private _createFormControls(config) {
        for (let i = 0; i < config.length; i++) {
            let field = config[i];
            if (field instanceof UniFieldBuilder) {
                this._createFormControl(field);
            } else {
                this._createFormControls(field.fields);
            }
        }
    }

    private _createFormControl(config) {
        config.errorMessages = MessageComposer.composeMessages(config);

        config.control = ControlBuilder.build(
            config,
            ValidatorsComposer.composeSyncValidators(config),
            ValidatorsComposer.composeAsyncValidators(config)
        );

        this.controls[config.field] = config.control;
    }

    private _getNumberOfFields(fields): number {
        if (this.numberOfFields >= 0) {
            return this.numberOfFields;
        }
        var nfields = 0;

        for (let i = 0; i < fields.length; i++) {
            if (fields[i] instanceof UniFieldBuilder) {
                nfields++;
            } else {
                this._getNumberOfFields(fields[i].fields);
            }
        }

        this.numberOfFields = nfields;
        return nfields;
    }

    private doSubmit(): boolean {
        this.sync();
        this.submit.emit(this.form);
        return false;
    }
}