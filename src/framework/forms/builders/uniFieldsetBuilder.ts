import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldset} from "./../uniFieldset";
import {Type} from "angular2/core";

declare var _;

export class UniFieldsetBuilder {
    legend: string = "";
    fields: Array<UniFieldBuilder> = [];
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    classes = [];

    static fromLayoutConfig(element: any): UniFieldsetBuilder {
        var ufsb = new UniFieldsetBuilder();
        //console.log("fieldset legend", element);
        ufsb.fieldsetIndex = element.FieldSet;
        ufsb.sectionIndex = element.Section;
        ufsb.legend = element.FieldsetLegend || element.Legend;
        ufsb.fieldType = UniFieldset;

        return ufsb;
    }

    constructor(legend?: string) {
        this.legend = legend || "";
        this.fieldType = UniFieldset;
    }

    addField(field: UniFieldBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: UniFieldBuilder[]) {
        fields.forEach((field: UniFieldBuilder) => {
            this.fields.push(field);
        });
        return this;
    }

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config(): Array<UniFieldBuilder> {
        return this.fields;
    }
}
