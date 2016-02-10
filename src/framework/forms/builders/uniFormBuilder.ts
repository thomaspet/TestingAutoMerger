import {UniFieldBuilder, UniFieldsetBuilder, UniGroupBuilder} from '../../forms';
import {IElementBuilder,IElementBuilderCollection} from './../interfaces';

declare var _;

export class UniFormBuilder {
    editMode: boolean = true;
    fields:IElementBuilderCollection=[];
    isSubmitButtonHidden: boolean = false;
    classes = [];
    formIndex: number = 0;

    constructor() {}

    addField(field:IElementBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields:  Array<IElementBuilder>) {
        fields.forEach((field:IElementBuilder)=>{
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

    addClass(className:string, callback: boolean|((...params:Array<any>)=>boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config() {
        return this.fields;
    }

    findFieldByPropertyName(name:string,collection?:any[]) {
        if (!collection) {
            collection = this.fields;
        }
        var ret = undefined;
        collection.forEach((element)=>{
            if (element instanceof UniFieldBuilder) {
                if (element.field === name) {
                    ret = element;
                }
            } else {
                this.findFieldByPropertyName(name,element.fields);
            }
        });
        return ret;
    }

    findFieldset(index:number):UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        this.fields.forEach((element:IElementBuilder)=>{
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }

    findGroup(index:number): UniGroupBuilder {
        var value: UniGroupBuilder = undefined;
        this.fields.forEach((element:IElementBuilder)=>{
            if (element.sectionIndex === index && element instanceof UniGroupBuilder) {
                value = element;
            }
        });
        return value;
    }


    _readmode(fields: IElementBuilderCollection) {
        fields.forEach((field: IElementBuilder)=>{
           if (field instanceof UniFieldBuilder) {
               field.readmode();
           } else {
               this._readmode(<any>field.config());
           }
        });
    }
    
    _editmode(fields: IElementBuilderCollection) {
        fields.forEach((field: IElementBuilder)=>{
           if (field instanceof UniFieldBuilder) {
               field.editmode();
           } else {
               this._editmode(<any>field.config());
           }
        });
    }
}
