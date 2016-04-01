import {Component, Input} from "angular2/core";

@Component({
    selector: "uni-url",
    template: `
        <input
            class="uni-url-input"
            *ngIf="config.control"
            type="url"
            [ngFormControl]="config.control"
            [readonly]="config.readonly"
            [disabled]="config.disabled"
        />
        <button class="uni-url-openBtn" (click)="openUrl()" [disabled]="!validateURL(config.control.value)">...</button>
    `
})
export class UniUrlInput {
    @Input()
    config: any;

    constructor() {
    }

    ngOnInit() {
        this.config.fieldComponent = this;
    }

    refresh(value: any): void {
        this.config.control.updateValue(value, {});
    }
    
    openUrl() {
        var url = this.config.control.value || "";
        if (this.validateURL(url)) {
            var wintab = window.open(url, '_blank');
            wintab.focus();           
        }
    }
    
    validateURL(url) {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(url);
    }
}
