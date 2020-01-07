import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges, ViewChild,
    OnChanges, AfterViewInit
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';

import {BaseControl} from '../baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-url-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './url.html'
})
export class UniUrlInput extends BaseControl implements OnChanges, AfterViewInit {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniUrlInput> = new EventEmitter<UniUrlInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniUrlInput> = new EventEmitter<UniUrlInput>(true);
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    private lastControlValue: string;
    @ViewChild('input', { static: false }) private inputElement: ElementRef;

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

    public blurHandler() {
        if (this.lastControlValue === this.control.value) {
            return;
        }

        let newUrl = this.control.value;
        if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://') && newUrl !== '') {
            newUrl = 'https://' + newUrl;
        }

        if (this.validateURL(newUrl) || newUrl === '') {
            const previousValue = _.get(this.model, this.field.Property);
            _.set(this.model, this.field.Property, newUrl);
            this.lastControlValue = newUrl;
            this.emitChange(previousValue, newUrl);
        }
    }

    public openUrl() {
        const url = this.control.value || '';
        if (this.validateURL(url)) {
            const wintab = window.open(url, '_blank');
            wintab.focus();
        }
    }

    public validateURL(url) {
        const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([æøåa-zA-Z0-9-]+\.)*[æøåa-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(url);
    }
}
