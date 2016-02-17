import {UniElementBuilder} from "../interfaces";

export class UniGrouper {
    fields: UniElementBuilder[];

    addField(field: UniElementBuilder) {
        this.fields.push(field);
        return this;
    }

    addFields(...fields: Array<UniElementBuilder>) {
        fields.forEach((field: UniElementBuilder) => {
            this.fields.push(field);
        });
        return this;
    }
}
