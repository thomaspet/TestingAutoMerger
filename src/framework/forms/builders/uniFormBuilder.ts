import {UniFieldBuilder, UniFieldsetBuilder, UniGroupBuilder, UniComboGroupBuilder} from "../../forms";
import {UniElementBuilder, UniElementBuilderCollection} from "./../interfaces";
import {UniGrouper} from "../shared/UniGrouper";

declare var _;

export class UniFormBuilder extends UniGrouper {
    editMode: boolean = true;
    fields: UniElementBuilderCollection = [];
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

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
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
            if (element instanceof UniFieldBuilder) {
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

    findGroup(index: number): UniGroupBuilder {
        var value: UniGroupBuilder = undefined;
        this.fields.forEach((element: UniElementBuilder) => {
            if (element.sectionIndex === index && element instanceof UniGroupBuilder) {
                value = element;
            }
        });
        return value;
    }

    findComboGroup(index: number): UniComboGroupBuilder {
        var value: UniComboGroupBuilder = undefined;
        this.fields.forEach((element: UniElementBuilder) => {
            if (element.sectionIndex === index && element instanceof UniComboGroupBuilder) {
                value = element;
            }
        });
        return value;
    }

    _readmode(fields: UniElementBuilderCollection) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniFieldBuilder) {
                field.readmode();
            } else {
                this._readmode(<any>field.config());
            }
        });
    }

    _editmode(fields: UniElementBuilderCollection) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniFieldBuilder) {
                field.editmode();
            } else {
                this._editmode(<any>field.config());
            }
        });
    }
}
