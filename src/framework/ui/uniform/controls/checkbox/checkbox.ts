import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewChild,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces';
import {MatCheckbox} from '@angular/material';

@Component({
    selector: 'uni-checkbox-input',
    templateUrl: './checkbox.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniCheckboxInput extends BaseControl {
    @ViewChild(MatCheckbox, { static: false }) public checkbox: MatCheckbox;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;

    @Output() public readyEvent: EventEmitter<UniCheckboxInput> = new EventEmitter<UniCheckboxInput>();
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    public checked: boolean;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    public ngOnChanges(changes) {
        if (this.model && this.field) {
            this.checked = !!(_.get(this.model, this.field.Property));
        }
    }

    public focus() {
        if (this.checkbox) {
            this.checkbox.focus();
        }

        return this;
    }

    public onChange(event) {
        const checked = event.checked;
        _.set(this.model, this.field.Property, checked);

        this.emitChange(!checked, checked);
        this.emitInstantChange(!checked, checked, true);
    }
}
