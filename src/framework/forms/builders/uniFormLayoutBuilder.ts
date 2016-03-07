import {UniFormBuilder, UniFieldBuilder, UniFieldsetBuilder, UniSectionBuilder} from "../../forms";
import {IComponentLayout, IFieldLayout} from "../../../app/interfaces";
import {UniElementFinder} from "../shared/UniElementFinder";
import {UniElementBuilder} from "../interfaces";
import {UniComboFieldBuilder} from "./uniComboFieldBuilder";

/**
 *
 * Builds a Form Layout from an IComponentLayout that comes from server
 *
 */
export class UniFormLayoutBuilder {

    static addElement(element: IFieldLayout, layout: UniFormBuilder, model: any) {
        let section: UniSectionBuilder,
            fieldset: UniFieldsetBuilder,
            combo: UniComboFieldBuilder, // soon
            field: UniFieldBuilder,
            context: any;

        context = layout;
        field = UniFieldBuilder.fromLayoutConfig(element, model);

        if (element.Section > 0) {
            section = UniElementFinder.findUniSection(element.Section, context.config());
            if (!section) {
                section = UniSectionBuilder.fromLayoutConfig(element);
                context.addUniElement(section);
            }
            context = section;
        }
        if (element.FieldSet > 0) {
            fieldset = UniElementFinder.findUniFieldset(element.Section, element.FieldSet, context.config());
            if (!fieldset) {
                fieldset = UniFieldsetBuilder.fromLayoutConfig(element);
                context.addUniElement(fieldset);
            }
            context = fieldset;
        }

        // check combofield here when it is available

        context.addUniElement(field);
    }

    constructor() {

    }

    build(schema: IComponentLayout, model: any) {
        var layout = new UniFormBuilder();
        schema.Fields.forEach((element: IFieldLayout) => {
            UniFormLayoutBuilder.addElement(element, layout, model);
        });
        return layout;
    }
}
