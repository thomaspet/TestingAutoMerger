import {UniInputBuilder} from "./uniInputBuilder";
import {Type} from "angular2/core";
import {UniComboInput} from "./../uniComboInput";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";

declare var _;

export class UniComboInputBuilder extends UniGenericBuilder {
    legend: string = "";
    fields: Array<UniInputBuilder> = [];
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;

    static fromLayoutConfig(element: any): UniComboInputBuilder {
        var ucgb = new UniComboInputBuilder();

        ucgb.fieldsetIndex = element.FieldSet;
        ucgb.sectionIndex = element.Section;
        ucgb.legend = element.Legend;
        ucgb.fieldType = UniComboInput;

        return ucgb;
    }

    constructor(legend?: string) {
        super();
        this.legend = legend || "";
        this.fieldType = UniComboInput;
    }




    config() {
        return this.fields;
    }
}
