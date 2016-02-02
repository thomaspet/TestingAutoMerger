import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniComboBuilder} from './uniComboBuilder';
import {FIELD_TYPES} from "./uniForm";

export class UniGroupBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniComboBuilder>=[];
    fieldType:number;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = FIELD_TYPES.GROUP;
    }

    addField(field:UniFieldBuilder|UniFieldsetBuilder|UniComboBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields:Array<UniFieldBuilder|UniFieldsetBuilder|UniComboBuilder>) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    config() {
        return this.fields;
    }
}

