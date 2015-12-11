import {UniField} from './uniField';
import {UniFieldset} from './uniFieldset';

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniField|UniFieldset>=[];
    constructor(legend?:string) {
        this.legend = legend || "";
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

