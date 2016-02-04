import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldset} from "./uniFieldset";
import {Type} from 'angular2/core';

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder>=[];
    fieldType: Type;
    fieldsetIndex:number = 0;
    sectionIndex:number = 0;

    static fromLayoutConfig(element:any):UniFieldsetBuilder {
        var ufb = new UniFieldsetBuilder();

        //ufb.label = element.Label;
        //ufb.description = element.Description;
        //ufb.readonly = element.ReadOnly;
        //ufb.isLookup = element.LookupField;
        //ufb.helpText = element.helpText;
        ufb.fieldsetIndex = element.FieldSet;
        ufb.sectionIndex = element.Section;
        ufb.legend = element.Legend;
        //ufb.hidden = element.Hidden;
        //ufb.placement = element.placement;
        //ufb.entityType = element.EntityType;
        //ufb.componentLayoutID = element.ComponentLayoutID;
        //ufb.field = element.Property;
        ufb.fieldType = UniFieldset;

        return ufb;
    }

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

    config():Array<UniFieldBuilder> {
        return this.fields;
    }
}
