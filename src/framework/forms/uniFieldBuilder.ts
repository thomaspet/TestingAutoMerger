import {FIELD_TYPES} from './uniForm';

export class UniFieldBuilder {
    label: string = '';
    model: any;
    field: string = '';
    type: string = 'text';
    fieldType: number;
    kOptions: any;
    classes: any = {};
    readonly: boolean = false;
    disabled: boolean = false;
    syncValidators: Array<any> = [];
    asyncValidators: Array<any> = [];

    constructor(type?:string,label?:string,model?:string,modelField?:string){
        this.type = type || 'text';
        this.label = label || '';
        this.model = model || undefined;
        this.field = modelField || '';
        this.fieldType = FIELD_TYPES.FIELD;

        return this;
    }

    setLabel(label:string) {
        this.label = label;
        return this;
    }
    setModel(model: any) {
        this.model = model;
        return this;
    }
    setModelField(key:string) {
        this.field = key;
        return this;
    }
    setType(type:string) {
        this.type = type;
        return this;
    }
    setKendoOptions(kOptions:any){
        this.kOptions = kOptions;
        return this;
    }
    addClass(className:string) {
        this.classes[className] = true;
        return this;
    }
    addSyncValidator(name:string,validator:Function,message:string) {
        this.syncValidators.push({
            name:name,
            validator: validator,
            message:message
        });
        return this;
    }
    addAsyncValidator(name:string,validator:Function,message:string) {
        this.asyncValidators.push({
            name:name,
            validator: validator,
            message:message
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
}

