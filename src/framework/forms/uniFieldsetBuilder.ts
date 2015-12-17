import {UniField} from './uniField';
import {FIELD_TYPES} from "./uniForm";

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniField>=[];
    fieldType: number;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = FIELD_TYPES.FIELDSET;
    }

    addField(field:UniField) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: UniField[]) {
        fields.forEach((field)=>{
            this.fields.push(field);
        });
        return this;
    }

    config() {
        return this.fields;
    }
}
