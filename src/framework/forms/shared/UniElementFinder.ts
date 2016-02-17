import {UniSectionBuilder} from "../builders/uniSectionBuilder";
import {UniFieldBuilder} from "../builders/uniFieldBuilder";
import {UniFieldsetBuilder} from "../builders/uniFieldsetBuilder";
import {UniElementBuilder} from "../interfaces";
import {UniComboFieldBuilder} from "../builders/uniComboFieldBuilder";

export class UniElementFinder {

    static findUniFieldByPropertyName(name: string, collection: any[]) {
        var ret = undefined;
        collection.forEach((element: any) => {
            if (element instanceof UniFieldBuilder) {
                if (element.field === name) {
                    ret = element;
                }
            } else {
                this.findUniFieldByPropertyName(name, element.fields);
            }
        });
        return ret;
    }

    static findUniFieldset(index: number, collection: any[]): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        collection.forEach((element: UniElementBuilder) => {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
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

    static findFieldset(index: number, collection:any[]): UniFieldsetBuilder {
        var value: UniFieldsetBuilder = undefined;
        collection.forEach((element: UniElementBuilder) => {
            if (element.fieldsetIndex === index && element instanceof UniFieldsetBuilder) {
                value = element;
            }
        });
        return value;
    }

    static findUniComboField(index: number, collection: any[]): UniComboFieldBuilder {
        var value: UniComboFieldBuilder = undefined;
        collection.forEach((element: UniElementBuilder) => {
            if (element.comboIndex === index && element instanceof UniComboFieldBuilder) {
                value = element;
            }
        });
        return value;
    }
}
