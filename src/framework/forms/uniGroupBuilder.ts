import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniComboGroupBuilder} from './uniComboGroupBuilder';
import {UniGroup} from "./uniGroup";
import {FIELD_TYPES} from "./uniForm";
import {Type} from 'angular2/core';

export class UniGroupBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder>=[];
    collapsed: boolean = false;
    fieldType:Type;
    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = UniGroup;
    }

    addField(field:UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields:Array<UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder>) {
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

