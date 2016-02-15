import {Type} from "angular2/core";
import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldsetBuilder} from "./uniFieldsetBuilder";
import {UniGroup} from "./../uniGroup";
import {UniComboGroupBuilder} from "./uniComboGroupBuilder";

declare var _;

export class UniGroupBuilder {
    legend: string = "";
    fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder> = [];
    collapsed: boolean = false;
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    classes = [];

    static fromLayoutConfig(element: any): UniGroupBuilder {
        var ugb = new UniGroupBuilder();
        
        ugb.fieldsetIndex = element.FieldSet;
        ugb.sectionIndex = element.Section;
        ugb.legend = element.Legend;
        ugb.collapsed = element.openByDefault;
        ugb.fieldType = UniGroup;
        
        return ugb;
    }

    constructor(legend?: string) {
        this.legend = legend || "";
        this.fieldType = UniGroup;
    }

    addField(field: UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: Array<UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder>) {
        fields.forEach((field: UniFieldBuilder|UniFieldsetBuilder|UniComboGroupBuilder) => {
            this.fields.push(field);
        });
        return this;
    }

    openByDefault(value: boolean) {
        this.collapsed = value;
    }

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config(): Array<UniFieldBuilder|UniFieldsetBuilder> {
        return this.fields;
    }

    findFieldset(index: number): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        this.fields.forEach((element: UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniComboGroupBuilder) => {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }
}
