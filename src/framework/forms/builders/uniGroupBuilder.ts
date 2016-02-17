import {Type} from "angular2/core";
import {UniFieldBuilder} from "./uniFieldBuilder";
import {UniFieldsetBuilder} from "./uniFieldsetBuilder";
import {UniSection} from "./../uniSection";
import {UniComboGroupBuilder} from "./uniComboGroupBuilder";
import {UniGrouper} from "../shared/UniGrouper";
import {UniElementBuilder} from "../interfaces";

declare var _;

export class UniGroupBuilder extends UniGrouper {
    legend: string = "";
    fields: UniElementBuilder[] = [];
    collapsed: boolean = false;
    fieldType: Type;
    fieldsetIndex: number = 0;
    sectionIndex: number = 0;
    classes = [];

    static fromLayoutConfig(element: any): UniGroupBuilder {
        var ugb = new UniGroupBuilder();

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

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config(): UniElementBuilder[] {
        return this.fields;
    }

    findFieldset(index: number): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        this.fields.forEach((element: UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniComboGroupBuilder) => {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }
}
