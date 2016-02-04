import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldset} from "./uniFieldset";
import {Type} from 'angular2/core';

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder>=[];
    fieldType: Type;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = UniFieldset;
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

    config() {
        return this.fields;
    }
}
