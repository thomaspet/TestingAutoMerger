import {UniField} from './uniField';
import {UniFieldset} from './uniFieldset';
import {FIELD_TYPES} from "./uniForm";

export class UniGroupBuilder {
    legend: string = '';
    fields: Array<UniField|UniFieldset>=[];
    fieldType:number;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = FIELD_TYPES.GROUP;
    }

    addField(field:UniField|UniFieldset) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: (UniField|UniFieldset)[]) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    config() {
        return this.fields;
    }
}

