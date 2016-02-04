import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroupBuilder} from './uniGroupBuilder';
import {FIELD_TYPES} from './uniForm';

declare var _;

export class UniFormBuilder {
    editMode: boolean = true;
    fields:Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder>=[];
    isSubmitButtonHidden: boolean = false;
    classes = [];

    constructor() {}

    addField(field:UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder>) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    readmode() {
        this._readmode(this.fields);
        this.editMode = false;
    }
    
    editmode() {
        this._editmode(this.fields);
        this.editMode = true;
    }

    isEditable() {
        return this.editMode;
    }

    hideSubmitButton() {
        this.isSubmitButtonHidden = true;
    }

    showSubmitButton() {
        this.isSubmitButtonHidden = false;
    }

    addClass(className:string, callback:any) {
        this.classes[className] = callback;
        return this;
    }

    config() {
        return this.fields;
    }

    findFieldset(index:number):UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        this.fields.forEach((element:UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder)=>{
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }

    findGroup(index:number): UniGroupBuilder {
        var value: UniGroupBuilder = undefined;
        this.fields.forEach((element:UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder)=>{
            if (element.sectionIndex === index && element instanceof UniGroupBuilder) {
                value = element;
            }
        });
        return value;
    }


    _readmode(fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder>) {
        fields.forEach((field: UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder)=>{
           if (field instanceof UniFieldBuilder) {
               field.readmode();
           } else {
               this._readmode(<any>field.config());
           }
        });
    }
    
    _editmode(fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder>) {
        fields.forEach((field: UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder)=>{
           if (field instanceof UniFieldBuilder) {
               field.editmode();
           } else {
               this._editmode(<any>field.config());
           }
        });
    }
}
