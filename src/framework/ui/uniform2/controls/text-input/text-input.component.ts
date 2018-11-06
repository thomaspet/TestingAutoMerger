import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { KeyCodes } from '@app/services/common/keyCodes';
import { fromEvent } from 'rxjs/observable/fromEvent';

@Component({
    selector: 'uni-text-input2',
    templateUrl: './text-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: TextInputComponent, multi: true },
    ]
})
export class TextInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<TextInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<TextInputComponent> = new EventEmitter();
    @ViewChild('textinput') input: ElementRef;
    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('', { updateOn: 'blur'});
    lastValidValue;

    constructor() { }

    ngOnInit() {
        // emit a change to the parent form
        this.mainControl.valueChanges.subscribe(x => {
            if (this.onChange) {
                this.lastValidValue = x;
                this.onChange(x);
            }
        });
    }

    ngAfterViewInit() {
        fromEvent(this.input.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.DELETE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.mainControl.setValue('');
            });
        fromEvent(this.input.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESCAPE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.mainControl.setValue(this.lastValidValue);
            });
    }

    // used to initialize the component with the control value
    writeValue(value: string) {
        this.lastValidValue = value;
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
}
