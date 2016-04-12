import {UniFieldBuilder} from '../../forms';
import {UniElementBuilder} from './../interfaces';
import {UniGenericBuilder} from '../shared/UniGenericBuilder';
import {UniElementFinder} from '../shared/UniElementFinder';

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

    find(property: string) {
        return UniElementFinder.findUniFieldByPropertyName(property, this.fields);
    }

    setModel(newInstance: any, config?: any) {
        var config = config || this.fields;

        for (let i = 0; i < config.length; i++) {
            let field: any = config[i];
            if (field instanceof UniFieldBuilder) {
                field.model = newInstance;
                var fieldPath = field.field;
                var value = _.get(newInstance, fieldPath);
                field.refresh(value);
            } else {
                this.setModel(newInstance, field.fields);
            }
        }
        return this;
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
