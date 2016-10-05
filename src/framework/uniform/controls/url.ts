import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _,jQuery; // jquery and lodash

@Component({
    selector: 'uni-url-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            class="nir-url-input"
            *ngIf="control"
            type="url"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler()"
        />
        <button class="uni-url-openBtn" 
                (click)="openUrl()" 
                [disabled]="!validateURL(control?.value)">...</button>
    `
})
export class UniUrlInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public onReady: EventEmitter<UniUrlInput> = new EventEmitter<UniUrlInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    private lastControlValue: string;
    
    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        jQuery(this.elementRef.nativeElement).find('input').first().focus();
        return this;
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngOnChanges() {
        this.lastControlValue = this.control.value;
    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
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
            lodash.set(this.model, this.field.Property, newUrl);
            this.lastControlValue = newUrl;
            this.onChange.emit(this.model);
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