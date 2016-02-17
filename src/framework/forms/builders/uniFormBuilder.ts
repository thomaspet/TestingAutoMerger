import {UniFieldBuilder, UniFieldsetBuilder, UniSectionBuilder, UniComboFieldBuilder} from "../../forms";
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

    _readmode(fields: UniElementBuilder[]) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniFieldBuilder) {
                field.readmode();
            } else {
                this._readmode(<any>field.config());
            }
        });
    }

    _editmode(fields: UniElementBuilder[]) {
        fields.forEach((field: UniElementBuilder) => {
            if (field instanceof UniFieldBuilder) {
                field.editmode();
            } else {
                this._editmode(<any>field.config());
            }
        });
    }
}
