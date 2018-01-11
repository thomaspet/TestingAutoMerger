import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ViewChild, SimpleChanges, OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces';

@Component({
    selector: 'uni-checkbox-input',
    templateUrl: './checkbox.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCheckboxInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniCheckboxInput> = new EventEmitter<UniCheckboxInput>(true);
    @Output() public focusEvent: EventEmitter<UniCheckboxInput> = new EventEmitter<UniCheckboxInput>(true);
    @Output() public inputEvent: EventEmitter<UniCheckboxInput> = new EventEmitter<UniCheckboxInput>();
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    @ViewChild('query') private inputElement: ElementRef;

    constructor() {
        super();
    }

    public ngOnChanges() {
        this.createControl();
    }

    public focus() {
        this.inputElement.nativeElement.focus();
        return this;
    }

    public checkIt() {
        if (this.field.ReadOnly) {
            return;
        }
        _.set(this.model, this.field.Property, !this.isChecked());
        this.emitChange(!this.isChecked(), this.isChecked());
        this.emitInstantChange(!this.isChecked(), this.isChecked(), true);
    }

    public isChecked() {
        const modelValue = _.get(this.model, this.field.Property);
        return modelValue;
    }
}
