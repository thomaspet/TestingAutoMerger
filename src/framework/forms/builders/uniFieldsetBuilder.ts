import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldset} from "./../uniFieldset";
import {Type} from "@angular/core";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";

declare var _;

export class UniFieldsetBuilder extends UniGenericBuilder {
    legend: string = "";
    fields: Array<UniFieldBuilder> = [];
    fieldType: Type;

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
}
