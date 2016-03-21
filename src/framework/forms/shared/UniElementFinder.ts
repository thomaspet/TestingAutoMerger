import {UniSectionBuilder} from "../builders/uniSectionBuilder";
import {UniFieldBuilder} from "../builders/uniFieldBuilder";
import {UniFieldsetBuilder} from "../builders/uniFieldsetBuilder";
import {UniElementBuilder} from "../interfaces";
import {UniComboFieldBuilder} from "../builders/uniComboFieldBuilder";

export class UniElementFinder {

    static findUniFieldByPropertyName(name: string, collection: any[]) {
        var ret = undefined;
        collection.forEach((element: any) => {
            if (ret != undefined) { return; }
            if (element instanceof UniFieldBuilder) {
                if (element.field === name) {
                    ret = element;
                }
            } else {
                ret = this.findUniFieldByPropertyName(name, element.fields);
            }
        });
        return ret;
    }

    static findUniFieldset(sectionIndex: number, fieldsetIndex: number, collection: any[]): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        if (sectionIndex > 0) {
            var section = UniElementFinder.findUniSection(sectionIndex, collection);
            if (section) {
                collection = section.config();
            }
        }
        collection.forEach((element: UniElementBuilder) => {
            if (element.fieldsetIndex === fieldsetIndex && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }

    static findUniSection(index: number, collection: any[]): UniSectionBuilder {
        var value: UniSectionBuilder = undefined;
        collection.forEach((element: UniElementBuilder) => {
            if (element.sectionIndex === index && element instanceof UniSectionBuilder) {
                value = element;
            }
        });
        return value;
    }

    static findUniComboField(sectionIndex: number, fieldsetIndex: number, index: number, collection: any[]): UniComboFieldBuilder {
        var value: UniComboFieldBuilder = undefined;
        if (sectionIndex > 0) {
            var section = UniElementFinder.findUniSection(sectionIndex, collection);
            if (section) {
                collection = section.config();
            }
        }
        if (fieldsetIndex > 0) {
            var fieldset = UniElementFinder.findUniFieldset(sectionIndex, fieldsetIndex, collection);
            if (fieldset) {
                collection = fieldset.config();
            }
        }
        collection.forEach((element: UniElementBuilder) => {
            if (element.comboIndex === index && element instanceof UniComboFieldBuilder) {
                value = element;
            }
        });
        return value;
    }
}
