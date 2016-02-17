import {UniFormBuilder, UniInputBuilder, UniFieldsetBuilder, UniSectionBuilder} from "../../forms";
import {IComponentLayout, IFieldLayout} from "../../interfaces/interfaces";

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

    static isUniFieldsetInAnUniSection(element: IFieldLayout) {
        return element.Section > 0 && element.FieldSet > 0;
    }

    constructor() {

    }

    build(schema: IComponentLayout, model: any) {
        var layout = new UniFormBuilder();
        schema.Fields.forEach((element: IFieldLayout) => {
            if (UniFormLayoutBuilder.isUniInput(element)) {
                layout.addUniElement(UniInputBuilder.fromLayoutConfig(element, model));// element to add to unifield
            } else {
                if (UniFormLayoutBuilder.isUniFieldSet(element)) {
                    var newFieldset = layout.findFieldset(element.FieldSet);
                    if (!newFieldset) {
                        newFieldset = UniFieldsetBuilder.fromLayoutConfig(element);// elements to add to unifieldset
                        layout.addUniElement(newFieldset);
                    }
                    newFieldset.addUniElement(UniInputBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isUniSection(element)) {
                    var newGroup = layout.findGroup(element.Section);
                    if (!newGroup) {
                        newGroup = UniSectionBuilder.fromLayoutConfig(element); //elements to add to groupbuilder
                        layout.addUniElement(newGroup);
                    }
                    newGroup.addUniElement(UniInputBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isUniFieldsetInAnUniSection(element)) {
                    var group = layout.findGroup(element.Section);
                    if (!group) {
                        group = UniSectionBuilder.fromLayoutConfig(element); // uniGroup
                        layout.addUniElement(group);
                    }

                    var fieldset = group.findFieldset(element.FieldSet);
                    if (!fieldset) {
                        fieldset = UniFieldsetBuilder.fromLayoutConfig(element); // fieldset
                        group.addUniElement(fieldset);
                    }

                    fieldset.addUniElement(UniInputBuilder.fromLayoutConfig(element, model));// element to add to unifield

                    // var combogroup = layout.findComboGroup(element.FieldSet);
                    // if (!combogroup) {
                    //     combogroup = UniComboInputBuilder.fromLayoutConfig(element); //Fieldset, UniComboInput
                    //     group.addUniElement(combogroup);
                    // }

                }
            }
        });
        return layout;
    }
}
