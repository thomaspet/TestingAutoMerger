import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-textarea-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <textarea
            *ngIf="control"
            [attr.aria-describedby]="asideGuid"
            [formControl]="control"
            [readonly]="readOnly$ | async"
            [cols]="field?.Options?.cols || 100"
            [rows]="field?.Options?.rows || 10"
            [placeholder]="field?.Placeholder || ''"
            (blur)="blurHandler($event)"
            (focus)="focusHandler()"
            [title]="control?.value || ''"
            (keydown)="onKeydown($event)"
        ></textarea>
        <ng-content></ng-content>
    `
})
export class UniTextareaInput extends BaseControl {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniTextareaInput> = new EventEmitter<UniTextareaInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniTextareaInput> = new EventEmitter<UniTextareaInput>(true);

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
            this.emitInstantChange(this.lastControlValue, value, true);
        });
    }

    public onKeydown(event: MouseEvent) {
        event.stopPropagation();
    }

    private blurHandler() {
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            let previousValue = _.get(this.model, this.field.Property);
            lodash.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.emitChange(previousValue, this.control.value);
        }
    }
}
