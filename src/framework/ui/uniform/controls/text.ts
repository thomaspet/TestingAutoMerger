import {Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input #input
            *ngIf="control"
            type="text"
            [attr.aria-describedby]="asideGuid"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler()"
            (focus)="focusHandler()"
            [title]="control?.value || ''"
        />
        <ng-content></ng-content>
    `
})
export class UniTextInput extends BaseControl {
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
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            let previousValue = lodash.get(this.model, this.field.Property);

            lodash.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.emitChange(previousValue, this.control.value);
        }
    }
}
