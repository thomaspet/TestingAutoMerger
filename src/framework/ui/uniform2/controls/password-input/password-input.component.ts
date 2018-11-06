import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

@Component({
    selector: 'uni-password-input2',
    templateUrl: './password-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: PasswordInputComponent, multi: true },
    ]
})
export class PasswordInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<PasswordInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<PasswordInputComponent> = new EventEmitter();
    @ViewChild('textinput') input: ElementRef;
    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('');
    type = 'password';

    constructor() { }

    ngOnInit() {
        // emit a change to the parent form
        this.mainControl.valueChanges.subscribe(x => {
            if (this.onChange) {
                this.onChange(x);
            }
        });
    }

    // used to initialize the component with the control value
    writeValue(value: string) {
        this.mainControl.setValue(value);
    }

    // this function is always this way.
    registerOnChange(onChange: (value: string) => void) {
        this.onChange = onChange;
    }

    // this function is alwas this way
    registerOnTouched(onTouched) {
        this.onTouched = onTouched;
    }

    onFocus() {
        this.focus.emit(this);
    }

    onBlur() {
        this.onTouched();
        this.blur.emit(this);
    }

    focusInput() {
        setTimeout(() => this.input.nativeElement.focus());
    }

    public showPassword() {
        this.type = this.type === 'password' ? 'text' : 'password';
    }
}
