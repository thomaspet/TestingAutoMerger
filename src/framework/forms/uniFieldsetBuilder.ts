import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldset} from "./uniFieldset";
import {Type} from 'angular2/core';

declare var _;

export class UniFieldsetBuilder {
    legend: string = '';
    fields: Array<UniFieldBuilder>=[];
    fieldType: Type;
    fieldsetIndex:number = 0;
    sectionIndex:number = 0;
    classes = [];

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

    addClass(className:string, callback:any) {
        this.classes[className] = callback;
        return this;
    }

    buildClassString() {
        var classes = [];
        for(var cl in this.classes) {
            if (this.classes.hasOwnProperty(cl)) {
                var value = undefined;
                if(_.isFunction(this.classes[cl])) {
                    value = this.classes[cl]();
                } else {
                    value = this.classes[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(" ");
    }

    config():Array<UniFieldBuilder> {
        return this.fields;
    }
}
