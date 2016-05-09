import {EventEmitter} from "angular2/core";
import {UNI_CONTROL_DIRECTIVES} from "../../controls";
import {UniField} from "./../uniField";
import {UniTextInput} from "../../controls/text/text";
import {Control} from "angular2/common";

declare var _;

export class UniFieldBuilder {
    public label: string = "";
    public defaultfield: string = "";
    public description: string = "";
    public url: string = "";
    public model: any;
    public field: string = "";
    public type: any = UniTextInput;
    public fieldType: any;
    public kOptions: any = {};
    public classes: any = {};
    public readonly: boolean = false;
    public disabled: boolean = false;
    public syncValidators: Array<any> = [];
    public asyncValidators: Array<any> = [];
    public control: Control;
    public comboIndex: number = 0;
    public fieldsetIndex: number = 0;
    public sectionIndex: number = 0;
    public isLookup: boolean = false;
    public helpText: string = "";
    public legend: string = "";
    public hidden: boolean = false;
    public placement: number = 0;
    public entityType: string = "";
    public componentLayoutID: number = 0;
    public errorMessages: Array<any> = [];
    public lineBreak: boolean = false;
    public fieldComponent: any;
    public onSelect: any;
    public clearOnSelect: any;
    public onChange: any;
    public onEnter: any;
    public onTab: any;
    public onUnTab: any;
    public editor: any;
    public placeholder: any;
    public ready: EventEmitter<any> = new EventEmitter<any>(true);
    
    public static fromLayoutConfig(element: any, model: any): UniFieldBuilder {
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
        ufb.syncValidators = element.Validators;

        if (element.kendoOptions !== undefined) {
            ufb.kOptions = element.kendoOptions;
        }

        return ufb;
    }

    constructor(type?: any, label?: string, model?: string, modelField?: string) {
        this.type = type || UniTextInput;
        this.label = label || "";
        this.model = model || undefined;
        this.field = modelField || "";
        this.fieldType = UniField;
        return this;
    }
    
    public setLabel(label: string) {
        this.label = label;
        return this;
    }

    public setDescription(description: string) {
        this.description = description;
        return this;
    }

    public setUrl(url: string) {
        this.url = url;
        return this;
    }

    public setModel(model: any) {
        this.model = model;
        return this;
    }

    public setModelField(key: string) {
        this.field = key;
        return this;
    }
    
    setModelDefaultField(key: string) {
        this.defaultfield = key;
        return this;
    }

    public setType(type: any) {
        this.type = type;
        return this;
    }
    
    setPlaceholder(placeholder: any) {
        this.placeholder = placeholder;
        return this;
    }
    
    setEditor(editor: any) {
        this.editor = editor;
        return this;
    }

    public setKendoOptions(kOptions: any) {
        this.kOptions = kOptions;
        return this;
    }

    public hasLineBreak(value: boolean) {
        this.lineBreak = value;
        return this;
    }

    public addClass(className: string, callback?: boolean|((...params: Array<any>) => boolean)) {
        if (callback === undefined || callback === null) {
            this.classes[className] = true;
        } else {
            this.classes[className] = callback;
        }
        return this;
    }

    public addSyncValidator(name: string, validator: Function, message: string) {
        this.syncValidators.push({
            name: name,
            validator: validator,
            message: message
        });
        return this;
    }

    public addAsyncValidator(name: string, validator: Function, message: string) {
        this.asyncValidators.push({
            name: name,
            validator: validator,
            message: message
        });
        return this;
    }

    public disable() {
        this.disabled = true;
    }

    public enable() {
        this.disabled = false;
    }

    public readmode() {
        this.readonly = true;
    }

    public editmode() {
        this.readonly = false;
    }

    public config(): UniFieldBuilder {
        return this;
    }

    public refresh(value: any) {
        this.fieldComponent.refresh(value);
    }

    public setFocus() {
        this.fieldComponent.setFocus();
    }
}

