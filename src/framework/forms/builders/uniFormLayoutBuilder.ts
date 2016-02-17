import {UniFormBuilder, UniFieldBuilder, UniFieldsetBuilder, UniGroupBuilder} from "../../forms";
import {IComponentLayout, IFieldLayout} from "../../interfaces/interfaces";

/**
 *
 * Builds a Form Layout from an IComponentLayout that comes from server
 *
 */
export class UniFormLayoutBuilder {

    static isField(element: IFieldLayout) {
        return element.FieldSet === 0 && element.Section === 0;
    }

    static isFieldSet(element: IFieldLayout) {
        return element.FieldSet > 0 && element.Section === 0;
    }

    static isGroup(element: IFieldLayout) {
        return element.Section > 0 && element.FieldSet === 0;
    }

    static isFieldsetInAGroup(element: IFieldLayout) {
        return element.Section > 0 && element.FieldSet > 0;
    }

    constructor() {

    }

    build(schema: IComponentLayout, model: any) {
        var layout = new UniFormBuilder();
        schema.Fields.forEach((element: IFieldLayout) => {
            if (UniFormLayoutBuilder.isField(element)) {
                layout.addField(UniFieldBuilder.fromLayoutConfig(element, model));// element to add to unifield
            } else {
                if (UniFormLayoutBuilder.isFieldSet(element)) {
                    var newFieldset = layout.findFieldset(element.FieldSet);
                    if (!newFieldset) {
                        newFieldset = UniFieldsetBuilder.fromLayoutConfig(element);// elements to add to unifieldset
                        layout.addField(newFieldset);
                    }
                    newFieldset.addField(UniFieldBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isGroup(element)) {
                    var newGroup = layout.findGroup(element.Section);
                    if (!newGroup) {
                        newGroup = UniGroupBuilder.fromLayoutConfig(element); //elements to add to groupbuilder
                        layout.addField(newGroup);
                    }
                    newGroup.addField(UniFieldBuilder.fromLayoutConfig(element, model));
                } else if (UniFormLayoutBuilder.isFieldsetInAGroup(element)) {
                    var group = layout.findGroup(element.Section);
                    if (!group) {
                        group = UniGroupBuilder.fromLayoutConfig(element); // uniGroup
                        layout.addField(group);
                    }

                    var fieldset = group.findFieldset(element.FieldSet);
                    if (!fieldset) {
                        fieldset = UniFieldsetBuilder.fromLayoutConfig(element); // fieldset
                        group.addField(fieldset);
                    }

                    fieldset.addField(UniFieldBuilder.fromLayoutConfig(element, model));// element to add to unifield

                    // var combogroup = layout.findComboGroup(element.FieldSet);
                    // if (!combogroup) {
                    //     combogroup = UniComboGroupBuilder.fromLayoutConfig(element); //Fieldset, UniComboGroup
                    //     group.addField(combogroup);
                    // }

                }
            }
        });
        return layout;
    }
}
