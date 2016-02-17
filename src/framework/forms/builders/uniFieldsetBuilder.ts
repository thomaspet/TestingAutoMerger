import {UniInputBuilder} from "./uniInputBuilder";
import {UniFieldset} from "./../uniFieldset";
import {Type} from "angular2/core";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";

declare var _;

export class UniFieldsetBuilder extends UniGenericBuilder {
    legend: string = "";
    fields: Array<UniInputBuilder> = [];
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;

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
