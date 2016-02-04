import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroup} from "./uniGroup";
import {Type} from 'angular2/core';

export class UniGroupBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder|UniFieldsetBuilder>=[];
    collapsed: boolean = false;
    fieldType:Type;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = UniGroup;
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

    openByDefault(value:boolean) {
        this.collapsed = value;
    }

    config() {
        return this.fields;
    }
}

