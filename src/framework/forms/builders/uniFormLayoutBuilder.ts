import {UniFormBuilder, UniFieldBuilder, UniFieldsetBuilder, UniGroupBuilder, UniComboGroupBuilder} from '../../forms';
import {IComponentLayout, IFieldLayout} from "../../interfaces/interfaces";

/**
 *
 * Builds a Form Layout from an IComponentLayout that comes from server
 *
 */
export class UniFormLayoutBuilder {

    constructor() {

    }

    build(schema:IComponentLayout, model: any) {
        var layout = new UniFormBuilder();
        schema.Fields.forEach((element:IFieldLayout)=> {
            if (this.isField(element)) {
                layout.addField(UniFieldBuilder.fromLayoutConfig(element, model));//Element to add to unifield
            } else {
                if (this.isFieldSet(element)) {
                    var newFieldset = layout.findFieldset(element.FieldSet);
                    if (!newFieldset) {
                        newFieldset = UniFieldsetBuilder.fromLayoutConfig(element);//Elements to add to unifieldset
                        layout.addField(newFieldset);
                    }
                    newFieldset.addField(UniFieldBuilder.fromLayoutConfig(element, model));
                }
                else if (this.isGroup(element)) {
                    var newGroup = layout.findGroup(element.Section);
                    if (!newGroup) {
                        newGroup = UniGroupBuilder.fromLayoutConfig(element); //Elements to add to groupbuilder
                        layout.addField(newGroup);
                    }
                    newGroup.addField(UniFieldBuilder.fromLayoutConfig(element, model));
                }
                else if (this.isFieldsetInAGroup(element)) {
                    var group = layout.findGroup(element.Section);
                    if (!group) {
                        group = UniGroupBuilder.fromLayoutConfig(element); //UniGroup
                        layout.addField(group);
                    }
                    
                    var fieldset = group.findFieldset(element.FieldSet);
                    if (!fieldset) {
                        fieldset = UniFieldsetBuilder.fromLayoutConfig(element); //Fieldset
                        group.addField(fieldset);
                    }
                    
                    fieldset.addField(UniFieldBuilder.fromLayoutConfig(element, model));//Element to add to unifield
                    
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

    isField(element:IFieldLayout) {
        return element.FieldSet === 0 && element.Section === 0;
    }

    isFieldSet(element:IFieldLayout) {
        return element.FieldSet > 0 && element.Section === 0;
    }

    isGroup(element:IFieldLayout) {
        return element.Section > 0 && element.FieldSet === 0;
    }

    isFieldsetInAGroup(element:IFieldLayout) {
        return element.Section > 0 && element.FieldSet > 0;
    }
}
