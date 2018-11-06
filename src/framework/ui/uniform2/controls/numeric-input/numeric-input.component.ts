import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import * as format from './number.helper';
import { CompanySettingsService } from '@app/services/common/companySettingsService';
import { INumberOptions } from '@uni-framework/ui/uniform';

@Component({
    selector: 'uni-numeric-input2',
    templateUrl: './numeric-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: NumericInputComponent, multi: true },
    ]
})
export class NumericInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<NumericInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<NumericInputComponent> = new EventEmitter();
    @ViewChild('textinput') input: ElementRef;
    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('');
    settingsDecimalLength: number;
    options: INumberOptions;
    constructor(private companySettingsService: CompanySettingsService) {
        this.companySettingsService.Get(1).subscribe(settings => {
            this.settingsDecimalLength = settings.ShowNumberOfDecimals;
        });
    }

    ngOnInit() {
        // emit a change to the parent form
        this.mainControl.valueChanges.subscribe(x => {
            if (this.onChange) {
                // format to number to emit value
                const result = format.toNumber(x, this.options);
                this.onChange(<any>result);
            }
        });
        this.initOptions();
    }

    private initOptions() {
        const fieldOptions = (this.config && this.config.Options) || {};

        const options = {
            format: fieldOptions.format,
            thousandSeparator: fieldOptions.thousandSeparator || ' ',
            decimalSeparator: fieldOptions.decimalSeparator || ',',
            decimalLength: fieldOptions.decimalLength || 0
        };

        if (this.settingsDecimalLength && options.format === 'money') {
            options.decimalLength = this.settingsDecimalLength;
        }

        this.options = options;
    }

    // used to initialize the component with the control value
    writeValue(value: string) {
        // parse value to write formatted numeber
        const result = format.toString(value, this.options);
        this.mainControl.setValue(result);
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
        // set mainControl to number
        const value = format.toNumber(this.mainControl.value, this.options);
        this.mainControl.setValue(value);
        this.focus.emit(this);
    }

    onBlur() {
        // set control to formatted string
        const value = format.toString(this.mainControl.value, this.options);
        this.mainControl.setValue(value);
        this.onTouched();
        this.blur.emit(this);
    }

    focusInput() {
        setTimeout(() => this.input.nativeElement.focus());
    }
}
