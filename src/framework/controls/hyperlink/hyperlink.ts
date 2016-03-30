import {Component, Input} from 'angular2/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

@Component({
    selector: 'uni-hyperlink',
    template: `
        <a [href]="config.url"
        >{{config.description}}</a>
    `
})
export class UniHyperlink {
    @Input()
    public config: UniFieldBuilder;

    constructor() {
    }

    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
