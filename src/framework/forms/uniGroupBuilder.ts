import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {FIELD_TYPES} from "./uniForm";

export class UniGroupBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder|UniFieldsetBuilder>=[];
    fieldType:number;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = FIELD_TYPES.GROUP;
    }

    addField(field:UniFieldBuilder|UniFieldsetBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields:Array<UniFieldBuilder|UniFieldsetBuilder>) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    config() {
        return this.fields;
    }
}

