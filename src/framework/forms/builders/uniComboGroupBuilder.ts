import {UniFieldBuilder} from './uniFieldBuilder';
import {FIELD_TYPES} from "./uniForm";
import {Type} from 'angular2/core';
import {UniComboGroup} from './uniComboGroup';

export class UniComboGroupBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder>=[];
    fieldType: Type;
    classes: any = {};
        
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = UniComboGroup;
    }

    addField(field:UniFieldBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: UniFieldBuilder[]) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    addClass(className:string) {
        this.classes[className] = true;
        return this;
    }
    
    config() {
        return this.fields;
    }
}
