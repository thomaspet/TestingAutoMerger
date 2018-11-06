import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { MatCheckbox, MatSlideToggle } from '@angular/material';

@Component({
    selector: 'uni-checkbox-input2',
    templateUrl: './checkbox-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: CheckboxInputComponent, multi: true },
    ]
})
export class CheckboxInputComponent implements ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<CheckboxInputComponent> = new EventEmitter();
    @Output() change: EventEmitter<boolean> = new EventEmitter();
    @Output() blur: EventEmitter<CheckboxInputComponent> = new EventEmitter();
    @ViewChild('input') input: MatCheckbox | MatSlideToggle;
    value = false;
    onChange: (value: string) => void;
    onTouched: () => void;
    constructor() { }

    onChangeCheckboxValue($event) {
        this.formControl.setValue($event.checked);
        // this.onChange($event.checked);
        this.change.emit($event.checked);
    }

    // used to initialize the component with the control value
    writeValue(value: any) {
        this.value = value;
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
        setTimeout(() => this.input.focus());
    }
}
