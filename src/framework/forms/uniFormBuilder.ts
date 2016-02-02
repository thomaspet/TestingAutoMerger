import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroupBuilder} from './uniGroupBuilder';
import {UniCombo} from './uniCombo';
import {FIELD_TYPES} from './uniForm';
 
export class UniFormBuilder {
    editMode: boolean = true;
    fields:Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniCombo>=[];

    constructor() {}

    addField(field:UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniCombo) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniCombo>) {
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

    config() {
        return this.fields;
    }
    
    _readmode(fields) {
        fields.forEach((field)=>{
           if (field.fieldType === FIELD_TYPES.FIELD) {
               field.readmode();
           } else {
               this._readmode(field.config());
           }
        });
    }
    
    _editmode(fields) {
        fields.forEach((field)=>{
           if (field.fieldType === FIELD_TYPES.FIELD) {
               field.editmode();
           } else {
               this._editmode(field.config());
           }
        });
    }
}
