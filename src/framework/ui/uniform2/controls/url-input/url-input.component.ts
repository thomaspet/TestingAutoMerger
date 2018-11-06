import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

@Component({
    selector: 'uni-url-input2',
    templateUrl: './url-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: UrlInputComponent, multi: true },
    ]
})
export class UrlInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<UrlInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<UrlInputComponent> = new EventEmitter();
    @ViewChild('textinput') input: ElementRef;
    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('');
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

    openUrl() {
        const url = this.mainControl.value || '';
        if (this.validateURL(url)) {
            const wintab = window.open(url, '_blank');
            wintab.focus();
        }
    }

    validateURL(url) {
        const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([æøåa-zA-Z0-9-]+\.)*[æøåa-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        return urlregex.test(url);
    }
}
