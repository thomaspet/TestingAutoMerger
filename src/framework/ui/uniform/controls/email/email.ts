import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges, OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';

import * as _ from 'lodash';


@Component({
    selector: 'uni-email-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './email.html'
})
export class UniEmailInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniEmailInput> = new EventEmitter<UniEmailInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniEmailInput> = new EventEmitter<UniEmailInput>(true);

    private lastControlValue: string;

    constructor(public elementRef: ElementRef) {
        super();
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
        return this;
    }

    public ngOnChanges() {
        this.createControl();
        this.lastControlValue = this.control.value;
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe((value: string) => {
            this.emitInstantChange(this.lastControlValue, value, this.control.valid);
        });
    }

    private blurHandler() {
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            const value = this.control.value.trim();
            const previousValue = _.get(this.model, this.field.Property);
            _.set(this.model, this.field.Property, value);
            this.lastControlValue = value;
            this.emitChange(previousValue, value);
            this.control.setValue(value, {emitEvent: false});
        }
    }

}
