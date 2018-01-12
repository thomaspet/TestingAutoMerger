import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-password-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password.html'
})
export class UniPasswordInput extends BaseControl implements OnChanges {
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

    public blurHandler() {
        if (this.lastControlValue === this.control.value) {
            return;
        }
        if (this.control.valid) {
            const previousValue = _.get(this.model, this.field.Property);
            _.set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.emitChange(previousValue, this.lastControlValue);
        }
    }

    public showPassword() {
        this.type = this.type === 'password' ? 'text' : 'password';
    }
}
