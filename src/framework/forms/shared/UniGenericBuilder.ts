import {UniElementBuilder} from "../interfaces";
import {UniInputBuilder} from "../builders/uniInputBuilder";

export class UniGenericBuilder {
    fields: UniElementBuilder[] = [];
    classes: any = {};
    legend: string = "";

    addUniElement(field: UniElementBuilder) {
        this.fields.push(field);
        return this;
    }

    addUniElements(...fields: Array<UniElementBuilder>) {
        fields.forEach((field: UniElementBuilder) => {
            this.fields.push(field);
        });
        return this;
    }

    addClass(className: string, callback?: boolean|((...params: Array<any>) => boolean)) {
        if (callback === undefined || callback === null) {
            this.classes[className] = true;
        } else {
            this.classes[className] = callback;
        }
        return this;
    }

    config() {
        return this.fields;
    }
}
