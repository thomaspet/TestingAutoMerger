import {UniFieldBuilder} from "./uniFieldBuilder";
import {Type} from "angular2/core";
import {UniComboField} from "./../uniComboField";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";

declare var _;

export class UniComboFieldBuilder extends UniGenericBuilder {
    legend: string = "";
    fields: Array<UniFieldBuilder> = [];
    fieldType: Type;

    static fromLayoutConfig(element: any): UniComboFieldBuilder {
        var ucgb = new UniComboFieldBuilder();

        ucgb.fieldsetIndex = element.FieldSet;
        ucgb.sectionIndex = element.Section;
        ucgb.legend = element.Legend;
        ucgb.fieldType = UniComboField;

        return ucgb;
    }

    constructor(legend?: string) {
        super();
        this.legend = legend || "";
        this.fieldType = UniComboField;
    }
}
