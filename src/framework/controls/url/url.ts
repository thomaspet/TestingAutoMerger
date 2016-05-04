import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery, _;

@Component({
    selector: 'uni-url',
    directives: [FORM_DIRECTIVES],
    template: `
        <input
            class="uni-url-input"
            *ngIf="control"
            type="url"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
        />
        <button class="uni-url-openBtn" (click)="openUrl()" [disabled]="!validateURL(control.value)">...</button>
    `
})
export class UniUrlInput {
    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);
    public isReady: boolean = true;

    get OnValueChanges() {
        return this.control.valueChanges;
    }

    get FormControl() {
        return this.control;
    }

    constructor(public elementRef: ElementRef) {
    }

    public setFocus() {
        jQuery(this.elementRef).focus();
        return this;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
        this.isReady = true;
        var self = this;
        this.control.valueChanges.subscribe((newValue: any) => {
            if (self.control.valid) {
                _.set(self.model, self.field.Property, newValue);
            }
        });

    }
    
    public openUrl() {
        var url = this.control.value || '';
        if (this.validateURL(url)) {
            var wintab = window.open(url, '_blank');
            wintab.focus();           
        }
    }
    
    public validateURL(url) {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(url);
    }
}
