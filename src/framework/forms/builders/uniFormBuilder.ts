import {UniInputBuilder, UniFieldsetBuilder, UniSectionBuilder, UniComboInputBuilder} from "../../forms";
import {UniElementBuilder} from "./../interfaces";
import {UniGenericBuilder} from "../shared/UniGenericBuilder";

declare var _;

export class UniFormBuilder extends UniGenericBuilder {
    editMode: boolean = true;
    fields: UniElementBuilder[] = [];
    isSubmitButtonHidden: boolean = false;
    classes = [];
    formIndex: number = 0;

    constructor() {
        super();
    }

    readmode(): void {
        this._readmode(this.fields);
        this.editMode = false;
    }

    editmode() {
        this._editmode(this.fields);
        this.editMode = true;
    }

    isEditable() {
        return this.editMode;
    }

    hideSubmitButton() {
        this.isSubmitButtonHidden = true;
    }

    showSubmitButton() {
        this.isSubmitButtonHidden = false;
    }

    config() {
        return this.fields;
    }

    findFieldByPropertyName(name: string, collection?: any[]) {
        if (!collection) {
            collection = this.fields;
        }
        var ret = undefined;
        collection.forEach((element: any) => {
            if (element instanceof UniInputBuilder) {
                if (element.field === name) {
                    ret = element;
                }
            } else {
                this.findFieldByPropertyName(name, element.fields);
            }
        });
        return ret;
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

    findGroup(index: number): UniSectionBuilder {
        var value: UniSectionBuilder = undefined;
        this.fields.forEach((element: UniElementBuilder) => {
            if (element.sectionIndex === index && element instanceof UniSectionBuilder) {
                value = element;
            }
        });
        return value;
    }

    findComboGroup(index: number): UniComboInputBuilder {
        var value: UniComboInputBuilder = undefined;
        this.fields.forEach((element: UniElementBuilder) => {
            if (element.sectionIndex === index && element instanceof UniComboInputBuilder) {
                value = element;
            }
        });
        return value;
    }

    _readmode(fields: UniElementBuilder[]) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniInputBuilder) {
                field.readmode();
            } else {
                this._readmode(<any>field.config());
            }
        });
    }

    _editmode(fields: UniElementBuilder[]) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniInputBuilder) {
                field.editmode();
            } else {
                this._editmode(<any>field.config());
            }
        });
    }
}
