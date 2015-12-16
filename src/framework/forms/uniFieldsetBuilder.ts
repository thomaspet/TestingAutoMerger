import {UniField} from './uniField';

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniField>=[];
    constructor(legend?:string) {
        this.legend = legend || "";
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
