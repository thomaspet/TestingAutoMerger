import {Component, Input} from 'angular2/core';
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";

@Component({
    selector: 'uni-hyperlink',
    template: `
        <a [href]="config.url"
        >{{config.description}}</a>
    `
})
export class UniHyperlink {
    @Input()
    config:UniFieldBuilder;

    constructor() {
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value) {
        this.config.control.updateValue(value, {});
    }
}
