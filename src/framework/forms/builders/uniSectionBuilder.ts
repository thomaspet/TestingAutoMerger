import {Type} from "angular2/core";
import {UniInputBuilder} from "./uniInputBuilder";
import {UniFieldsetBuilder} from "./uniFieldsetBuilder";
import {UniSection} from "./../uniSection";
import {UniComboInputBuilder} from "./uniComboInputBuilder";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";
import {UniElementBuilder} from "../interfaces";

declare var _;

export class UniSectionBuilder extends UniGenericBuilder {
    collapsed: boolean = false;
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    classes = [];

    static fromLayoutConfig(element: any): UniSectionBuilder {
        var ugb = new UniSectionBuilder();

        ugb.fieldsetIndex = element.FieldSet;
        ugb.sectionIndex = element.Section;
        ugb.legend = element.Legend;
        ugb.collapsed = element.openByDefault;
        ugb.fieldType = UniSection;

        return ugb;
    }

    constructor(legend?: string) {
        super();

        this.legend = legend || "";
        this.fieldType = UniSection;
    }

    openByDefault(value: boolean) {
        this.collapsed = value;
    }

    findFieldset(index: number): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        this.fields.forEach((element: UniElementBuilder) => {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }
}
