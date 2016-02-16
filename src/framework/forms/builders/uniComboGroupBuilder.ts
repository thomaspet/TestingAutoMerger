import {UniFieldBuilder} from "./../builders/uniFieldBuilder";
import {Type} from "angular2/core";
import {UniComboGroup} from "./../uniComboGroup";

declare var _;

export class UniComboGroupBuilder {
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
        ucgb.fieldType = UniComboGroup;

        return ucgb;
    }

    constructor(legend?: string) {
        this.legend = legend || "";
        this.fieldType = UniComboGroup;
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

    addClass(className: string) {
        this.classes[className] = true;
        return this;
    }

    config() {
        return this.fields;
    }
}
