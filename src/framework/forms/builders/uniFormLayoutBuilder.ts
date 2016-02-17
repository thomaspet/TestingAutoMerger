import {UniFormBuilder, UniFieldBuilder, UniFieldsetBuilder, UniSectionBuilder} from "../../forms";
import {IComponentLayout, IFieldLayout} from "../../interfaces/interfaces";
import {UniElementFinder} from "../shared/UniElementFinder";
import {UniComboField} from "../uniComboField";
import {UniComboFieldBuilder} from "./uniComboFieldBuilder";

/**
 *
 * Builds a Form Layout from an IComponentLayout that comes from server
 *
 */
export class UniFormLayoutBuilder {

    static isUniInput(element: IFieldLayout) {
        return element.FieldSet === 0 && element.Section === 0;
    }

    static isUniFieldSet(element: IFieldLayout) {
        return element.FieldSet > 0 && element.Section === 0;
    }

    static isUniSection(element: IFieldLayout) {
        return element.Section > 0 && element.FieldSet === 0;
    }

    static isUniFieldsetInsideAnUniSection(element: IFieldLayout) {
        return element.Section > 0 && element.FieldSet > 0;
    }

    static isUniComboField(element: IFieldLayout) {
        return false; // todo: check when combo is added to server interface
    }


    constructor() {

    }

    build(schema: IComponentLayout, model: any) {
        var layout = new UniFormBuilder();
        schema.Fields.forEach((element: IFieldLayout) => {
            if (UniFormLayoutBuilder.isUniInput(element)) {
                layout.addUniElement(UniFieldBuilder.fromLayoutConfig(element, model));// element to add to unifield
            } else {
                if (UniFormLayoutBuilder.isUniFieldSet(element)) {
                    var newFieldset = UniElementFinder.findUniFieldset(element.FieldSet, layout.config());
                    if (!newFieldset) {
                        newFieldset = UniFieldsetBuilder.fromLayoutConfig(element);// elements to add to unifieldset
                        layout.addUniElement(newFieldset);
                    }
                    newFieldset.addUniElement(UniFieldBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isUniSection(element)) {
                    var newGroup = UniElementFinder.findUniSection(element.Section, layout.config());
                    if (!newGroup) {
                        newGroup = UniSectionBuilder.fromLayoutConfig(element); //elements to add to groupbuilder
                        layout.addUniElement(newGroup);
                    }
                    newGroup.addUniElement(UniFieldBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isUniFieldsetInsideAnUniSection(element)) {
                    var group = UniElementFinder.findUniSection(element.Section, layout.config());
                    if (!group) {
                        group = UniSectionBuilder.fromLayoutConfig(element); // uniGroup
                        layout.addUniElement(group);
                    }

                    var fieldset = UniElementFinder.findFieldset(element.FieldSet, group.config());
                    if (!fieldset) {
                        fieldset = UniFieldsetBuilder.fromLayoutConfig(element); // fieldset
                        group.addUniElement(fieldset);
                    }

                    fieldset.addUniElement(UniFieldBuilder.fromLayoutConfig(element, model));// element to add to unifield

                }
            }
        });
        return layout;
    }
}
