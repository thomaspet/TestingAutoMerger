import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';

import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-url-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            #input
            [attr.aria-describedby]="asideGuid"
            class="nir-url-input"
            *ngIf="control"
            type="url"
            [formControl]="control"
            [readonly]="readOnly$ | async"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler()"
            (focus)="focusHandler()"
            [title]="control?.value || ''"
        />
        <button class="uni-url-openBtn" type="button"
                (click)="openUrl()"
                type="button"
                [disabled]="!validateURL(control?.value)">...</button>
        <ng-content></ng-content>
    `
})
export class UniUrlInput extends BaseControl{
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniUrlInput> = new EventEmitter<UniUrlInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniUrlInput> = new EventEmitter<UniUrlInput>(true);
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    private lastControlValue: string;
    @ViewChild('input') private inputElement: ElementRef;

    constructor(public elementRef: ElementRef) {
        super();
    }

    public focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
        return this;
    }

    public ngOnChanges() {
        this.createControl();
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe((value: string) => {
            this.emitInstantChange(this.lastControlValue, value, this.validateURL(value));
        });
        this.lastControlValue = this.control.value;
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
    }

    private blurHandler() {
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }

        let newUrl = this.control.value;
        if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            newUrl = 'http://' + newUrl;
        }

        if (this.validateURL(newUrl)) {
            let previousValue = lodash.get(this.model, this.field.Property);
            lodash.set(this.model, this.field.Property, newUrl);
            this.lastControlValue = newUrl;
            this.emitChange(previousValue, newUrl);
        }
    }

    private openUrl() {
        var url = this.control.value || '';
        if (this.validateURL(url)) {
            var wintab = window.open(url, '_blank');
            wintab.focus();
        }
    }

    private validateURL(url) {
        var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(url);
    }
}
