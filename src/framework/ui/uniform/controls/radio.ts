import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-radio-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <input
                #rd
                type="radio"
                [attr.aria-describedby]="asideGuid"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                [checked]="isChecked()"
                (focus)="focusHandler()"
            />
            <label (click)="checkIt()">{{field?.Label}}</label>
            <ng-content></ng-content>
    `
})
export class UniRadioInput extends BaseControl {
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
        var modelValue = _.get(this.model, this.field.Property);
        return modelValue;
    }
}
