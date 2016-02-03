import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroupBuilder} from './uniGroupBuilder';
import {UniCombo} from './uniCombo';
import {FIELD_TYPES} from './uniForm';

export class UniFormBuilder {
    editMode: boolean = true;
    fields:Array<UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniCombo>=[];
    isSubmitButtonHidden: boolean = false;

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

    hideSubmitButton() {
        this.isSubmitButtonHidden = true;
    }

    showSubmitButton() {
        this.isSubmitButtonHidden = false;
    }

    config() {
        return this.fields;
    }
    
    _readmode(fields) {
        fields.forEach((field)=>{
           if (field instanceof UniFieldBuilder) {
               field.readmode();
           } else {
               this._readmode(field.config());
           }
        });
    }
    
    _editmode(fields) {
        fields.forEach((field)=>{
           if (field instanceof UniFieldBuilder) {
               field.editmode();
           } else {
               this._editmode(field.config());
           }
        });
    }
}
