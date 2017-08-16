import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ViewChild, SimpleChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-checkbox-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <input
                #query
                [attr.aria-describedby]="asideGuid"
                type="checkbox"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked()"
                (focus)="focusHandler()"
            />
            <label (click)="checkIt()" tabindex="-1">{{field?.Label}}</label>
            <ng-content></ng-content>
    `
})
export class UniCheckboxInput extends BaseControl {
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
        var modelValue = _.get(this.model, this.field.Property);
        return modelValue;
    }
}
