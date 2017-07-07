import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';

import * as _ from 'lodash';


@Component({
    selector: 'uni-email-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="email"
            [attr.aria-describedby]="asideGuid"
            [formControl]="control"
            [readonly]="readOnly$ | async"
            [placeholder]="field?.Placeholder ||''"
            (blur)="blurHandler()"
            (focus)="focusHandler()"
            [title]="control?.value || ''"
        />
        <ng-content></ng-content>
    `
})
export class UniEmailInput extends BaseControl {
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

    public ngOnInit() {
        this.createControl();
    }

    public ngOnChanges() {
        this.lastControlValue = this.control.value;
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
        }
        this.controlSubscription = this.control.valueChanges.subscribe((value: string) => {
            this.emitInstantChange(this.lastControlValue, value, this.control.valid);
        });
    }

    private blurHandler() {
        var lodash = _;
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            let previousValue = lodash.get(this.model, this.field.Property);
            lodash.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.emitChange(previousValue, this.lastControlValue);
        }
    }
}
