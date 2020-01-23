import {
    Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges,
    ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import {get, set} from 'lodash';

@Component({
    selector: 'uni-password-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password.html'
})
export class UniPasswordInput extends BaseControl implements OnChanges {
    @ViewChild('inputElement', { static: false }) inputElement: ElementRef;
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

    constructor() {
        super();
    }

    public focus() {
        if (this.inputElement) {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        }
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
            const previousValue = get(this.model, this.field.Property);
            set(this.model, this.field.Property, this.control.value);
            this.lastControlValue = this.control.value;
            this.emitChange(previousValue, this.lastControlValue);
        }
    }

    public showPassword() {
        this.type = this.type === 'password' ? 'text' : 'password';
    }
}
