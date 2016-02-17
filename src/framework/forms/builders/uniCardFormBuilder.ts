import {UniFormBuilder} from "../../forms";
import {UniFormBuilderCollection} from "../interfaces";

declare var _;

export class UniCardFormBuilder {
    forms: UniFormBuilderCollection = [];
    classes = [];

    constructor() {
    }

    addForm(form: UniFormBuilder) {
        this.forms.push(form);
        return this;
    }

    addForms(...forms: Array<UniFormBuilder>) {
        forms.forEach((form: UniFormBuilder) => {
            this.forms.push(form);
        });
        return this;
    }

    addClass(className: string, callback: boolean|((...params: Array<any>) => boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config() {
        return this.forms;
    }

    findForm(index: number): UniFormBuilder {
        var value: UniFormBuilder = undefined;
        this.forms.forEach((element: UniFormBuilder) => {
            if (element.formIndex === index && element instanceof UniFormBuilder) {
                value = element;
            }
        });
        return value;
    }
}
