import {
    Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './text.html'
})
export class UniTextInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniTextInput> = new EventEmitter<UniTextInput>(true);


    @ViewChild('input') private inputElement: ElementRef;

    private lastControlValue: string;

    constructor() {
        super();
    }

    public focus() {
        const input: HTMLInputElement = this.inputElement.nativeElement;
        if (input) {
            input.focus();
            input.select();
        }
    }

    public ngOnChanges() {
        this.createControl();
        this.lastControlValue = this.control.value;
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe((value: string) => {
            this.emitInstantChange(this.lastControlValue, value, true);
        });
    }

    public blurHandler() {
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
