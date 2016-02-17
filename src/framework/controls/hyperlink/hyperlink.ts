import {Component, Input} from "angular2/core";
import {UniInputBuilder} from "../../forms/builders/uniInputBuilder";

@Component({
    selector: "uni-hyperlink",
    template: `
        <a [href]="config.url"
        >{{config.description}}</a>
    `
})
export class UniHyperlink {
    @Input()
    config: UniInputBuilder;

    constructor() {
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
