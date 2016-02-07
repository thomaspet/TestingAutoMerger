import {UniFieldBuilder} from './uniFieldBuilder';
import {UniFieldsetBuilder} from './uniFieldsetBuilder';
import {UniGroup} from "./uniGroup";
import {Type} from 'angular2/core';
import {UniFieldset} from "./uniFieldset";

declare var _;

export class UniGroupBuilder {
    legend:string = '';
    fields:Array<UniFieldBuilder|UniFieldsetBuilder> = [];
    collapsed:boolean = false;
    fieldType:Type;
    fieldsetIndex:number = 0;
    sectionIndex:number = 0;
    classes = [];

    static fromLayoutConfig(element:any):UniGroupBuilder {
        var ufb = new UniGroupBuilder();

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
        ufb.fieldType = UniGroup;

        return ufb;
    }

    constructor(legend?:string) {
        this.legend = legend || "";
        this.fieldType = UniGroup;
    }

    addField(field:UniFieldBuilder|UniFieldsetBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields:Array<UniFieldBuilder|UniFieldsetBuilder>) {
        fields.forEach((field)=> {
            this.fields.push(field);
        });
        return this;
    }

    openByDefault(value:boolean) {
        this.collapsed = value;
    }

    addClass(className:string, callback:any) {
        this.classes[className] = callback;
        return this;
    }

    config():Array<UniFieldBuilder|UniFieldsetBuilder> {
        return this.fields;
    }

    findFieldset(index:number):UniFieldsetBuilder {
        var value:UniFieldsetBuilder = undefined;
        this.fields.forEach((element:UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder)=> {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }
}

