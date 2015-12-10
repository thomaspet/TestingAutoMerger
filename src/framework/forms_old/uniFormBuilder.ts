import {UniField} from './uniField';

export class UniFormBuilder {

    fields:Array<UniField>=[];

    constructor() {}

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
