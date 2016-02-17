import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldset} from "./../uniFieldset";
import {Type} from "angular2/core";
import {UniGrouper} from "../shared/UniGrouper";

declare var _;

export class UniFieldsetBuilder extends UniGrouper {
    legend: string = "";
    fields: Array<UniFieldBuilder> = [];
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    classes = [];

    static fromLayoutConfig(element: any): UniFieldsetBuilder {
        var ufsb = new UniFieldsetBuilder();

        ufsb.fieldsetIndex = element.FieldSet;
        ufsb.sectionIndex = element.Section;
        ufsb.legend = element.FieldsetLegend || element.Legend;
        ufsb.fieldType = UniFieldset;

        return ufsb;
    }

    constructor(legend?: string) {
        super();
        this.legend = legend || "";
        this.fieldType = UniFieldset;
    }

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config(): Array<UniFieldBuilder> {
        return this.fields;
    }
}
