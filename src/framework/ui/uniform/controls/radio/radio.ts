import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-radio-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './radio.html'
})
export class UniRadioInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniRadioInput> = new EventEmitter<UniRadioInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniRadioInput> = new EventEmitter<UniRadioInput>(true);



    constructor(public elementRef: ElementRef) {
        super();
    }

    public ngOnChanges() {
        this.createControl();
    }

    public focus() {
        this.elementRef.nativeElement.focus();
        return this;
    }

    public checkIt() {
        _.set(this.model, this.field.Property, !this.isChecked());
        this.emitChange(!this.isChecked(), this.isChecked());
        this.emitInstantChange(!this.isChecked(), this.isChecked(), true);

    }

    public isChecked() {
        const modelValue = _.get(this.model, this.field.Property);
        return modelValue;
    }
}
