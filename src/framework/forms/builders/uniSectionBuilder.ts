import {Type} from "@angular/core";
import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldsetBuilder} from "./uniFieldsetBuilder";
import {UniSection} from "./../uniSection";
import {UniComboFieldBuilder} from "./uniComboFieldBuilder";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";
import {UniElementBuilder} from "../interfaces";

declare var _;

export class UniSectionBuilder extends UniGenericBuilder {
    collapsed: boolean = false;
    fieldType: Type;
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
}
