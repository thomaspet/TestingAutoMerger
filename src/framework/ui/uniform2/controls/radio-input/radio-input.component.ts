import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { MatCheckbox, MatSlideToggle } from '@angular/material';
import * as _ from 'lodash';

@Component({
    selector: 'uni-radio-input2',
    templateUrl: './radio-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: RadioInputComponent, multi: true },
    ]
})
export class RadioInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() source;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<RadioInputComponent> = new EventEmitter();
    @Output() change: EventEmitter<boolean> = new EventEmitter();
    @Output() blur: EventEmitter<RadioInputComponent> = new EventEmitter();
    @ViewChild('input') input: ElementRef;
    value: any;
    onChange: (value: string) => void;
    onTouched: () => void;
    constructor(public host: ElementRef) { }

    ngOnInit() {
        this.value = this.formControl.value;
    }

    ngAfterViewInit() {
        const radioInputs = this.host.nativeElement.querySelectorAll('input[type=radio]');
        radioInputs.forEach((radioInput: HTMLInputElement) => {
            radioInput.tabIndex = -1;
        });
    }

    onChangeRadioValue($event) {
        this.formControl.setValue($event.value);
        // this.onChange($event.value);
        this.change.emit($event.value);
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
        const element = this.input.nativeElement;
        if (element.children && element.children[0]) {
            element.children[0].focus();
        }
    }

    getRadioButtonValue(item) {
        return _.get(item, this.config.Options.valueProperty);
    }

    getRadioButtonLabel(item) {
        return _.get(item, this.config.Options.labelProperty);
    }

}
