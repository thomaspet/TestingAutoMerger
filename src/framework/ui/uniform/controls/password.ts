import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-password-input',
    changeDetection: ChangeDetectionStrategy.OnPush,

    template: `
        <input
            *ngIf="control"
            class="nir-password-input"
            [attr.aria-describedby]="asideGuid"
            [type]="type"
            [formControl]="control"
            [readonly]="readOnly$ | async"
            [placeholder]="field?.Placeholder ||''"
            (focus)="focusHandler()"
            (blur)="blurHandler()"
        />
        <button class="uni-password-viewBtn" (click)="showPassword()">...</button>
        <ng-content></ng-content>
    `
})
export class UniPasswordInput extends BaseControl {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniPasswordInput> = new EventEmitter<UniPasswordInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniPasswordInput> = new EventEmitter<UniPasswordInput>(true);

    private lastControlValue: string;
    private type: string = 'password';
    constructor(public elementRef: ElementRef) {
        super();
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        this.elementRef.nativeElement.children[0].select();
        return this;
    }

    public ngOnChanges() {
        this.createControl(this.lastControlValue);
        this.lastControlValue = this.control.value;
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe((value: string) => {
            this.emitInstantChange(this.lastControlValue, value, true);
        });
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
            this.emitChange(previousValue, this.lastControlValue);
        }
    }

    private showPassword() {
        this.type = this.type === 'password' ? 'text' : 'password';
    }
}
