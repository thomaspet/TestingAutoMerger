import {Type} from "angular2/core";
import {UNI_CONTROL_DIRECTIVES} from "../../controls";
import {UniField} from "./../uniField";
import {UniTextInput} from "../../controls/text/text";
import {Control} from "angular2/common";

declare var _;

export class UniFieldBuilder {
    label: string = "";
    description: string = "";
    url: string = "";
    model: any;
    field: string = "";
    type: Type = UniTextInput;
    fieldType: Type;
    kOptions: any = {};
    classes: any = {};
    readonly: boolean = false;
    disabled: boolean = false;
    syncValidators: Array<any> = [];
    asyncValidators: Array<any> = [];
    control: Control;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    isLookup: boolean = false;
    helpText: string = "";
    legend: string = "";
    hidden: boolean = false;
    placement: number = 0;
    entityType: string = "";
    componentLayoutID: number = 0;
    errorMessages: Array<any> = [];
    lineBreak: boolean = false;
    fieldComponent: any;
    onSelect: any;
    clearOnSelect: any;
    onChange: any;

    static fromLayoutConfig(element: any, model: any): UniFieldBuilder {
        var ufb = new UniFieldBuilder();

        ufb.model = model;
        ufb.label = element.Label;
        ufb.description = element.Description;
        ufb.readonly = element.ReadOnly;
        ufb.isLookup = element.LookupField;
        ufb.helpText = element.helpText;
        ufb.fieldsetIndex = element.FieldSet;
        ufb.sectionIndex = element.Section;
        ufb.legend = element.Legend;
        ufb.hidden = element.Hidden;
        ufb.placement = element.placement;
        ufb.entityType = element.EntityType;
        ufb.componentLayoutID = element.ComponentLayoutID;
        ufb.field = element.Property;
        ufb.fieldType = UniField;
        ufb.type = UNI_CONTROL_DIRECTIVES[element.FieldType];
        ufb.lineBreak = element.hasLineBreak || false;

        return ufb;
    }

    constructor(type?: Type, label?: string, model?: string, modelField?: string) {
        this.type = type || UniTextInput;
        this.label = label || "";
        this.model = model || undefined;
        this.field = modelField || "";
        this.fieldType = UniField;
        return this;
    }

    setLabel(label: string) {
        this.label = label;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setUrl(url: string) {
        this.url = url;
        return this;
    }

    setModel(model: any) {
        this.model = model;
        return this;
    }

    setModelField(key: string) {
        this.field = key;
        return this;
    }

    setType(type: Type) {
        this.type = type;
        return this;
    }

    setKendoOptions(kOptions: any) {
        this.kOptions = kOptions;
        return this;
    }

    hasLineBreak(value: boolean) {
        this.lineBreak = value;
        return this;
    }

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    addSyncValidator(name: string, validator: Function, message: string) {
        this.syncValidators.push({
            name: name,
            validator: validator,
            message: message
        });
        return this;
    }

    addAsyncValidator(name: string, validator: Function, message: string) {
        this.asyncValidators.push({
            name: name,
            validator: validator,
            message: message
        });
        return this;
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }

    readmode() {
        this.readonly = true;
    }

    editmode() {
        this.readonly = false;
    }

    config(): UniFieldBuilder {
        return this;
    }

    refresh(value: any) {
        this.fieldComponent.refresh(value);
    }
}

