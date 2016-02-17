import {UniFieldBuilder} from "./../builders/uniFieldBuilder";
import {Type} from "angular2/core";
import {UniComboInput} from "./../uniComboInput";
import {UniGrouper} from "../shared/UniGrouper";

declare var _;

export class UniComboGroupBuilder extends UniGrouper {
    legend: string = "";
    fields: Array<UniFieldBuilder> = [];
    fieldType: Type;
    classes: any = {};
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;

    static fromLayoutConfig(element: any): UniComboGroupBuilder {
        var ucgb = new UniComboGroupBuilder();

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


    addClass(className: string) {
        this.classes[className] = true;
        return this;
    }

    config() {
        return this.fields;
    }
}
