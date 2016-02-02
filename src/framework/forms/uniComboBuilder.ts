import {UniFieldBuilder} from './uniFieldBuilder';
import {FIELD_TYPES} from "./uniForm";

export class UniComboBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder>=[];
    fieldType: number;
    classes: any = {};
        
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = FIELD_TYPES.COMBO;
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
