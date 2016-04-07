import {Component, Input, ElementRef} from 'angular2/core';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';

declare var jQuery;

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
    public ready: Promise<boolean>;
    
    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }
    
    public ngOnInit() {
        this.config.fieldComponent = this;
    }

    public ngAfterViewInit() {
        this.config.isDomReady.emit(this);
    }

    public refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
}
