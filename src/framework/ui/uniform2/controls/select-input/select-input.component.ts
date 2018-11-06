import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef, ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { KeyCodes } from '@app/services/common/keyCodes';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { UniSelect } from '@uni-framework/ui/uniform';
import * as _ from 'lodash';

@Component({
    selector: 'uni-select-input2',
    templateUrl: './select-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: SelectInputComponent, multi: true },
    ]
})
export class SelectInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<SelectInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<SelectInputComponent> = new EventEmitter();
    @ViewChild('uniselect') input: UniSelect;
    onChange: (value: string) => void;
    onTouched: () => void;
    lastValidValue;
    selectedItem;
    items;

    constructor(public changeDetector: ChangeDetectorRef) { }

    ngOnInit() {
        if (this.config && this.config.Options && !this.config.Options.addEmptyValue) {
            let source = this.config.Options.source;
            if (source) {
                source = [].concat(source);
            }
            this.items = source;
        }
    }

    createFocusListener() {
        fromEvent(this.input.valueInput.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.DELETE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.selectedItem = null;
            });
        fromEvent(this.input.valueInput.nativeElement, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESCAPE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.selectedItem = this.lastValidValue;
            });

        fromEvent(this.input.valueInput.nativeElement, 'focus').subscribe(() => {
            this.focus.emit(this);
        });
    }

    // used to initialize the component with the control value
    writeValue(value: string) {
        this.lastValidValue = value;
        this.selectedItem = value;
        this.changeDetector.markForCheck();
    }

    // this function is always this way.
    registerOnChange(onChange: (value: string) => void) {
        this.onChange = onChange;
    }

    // this function is alwas this way
    registerOnTouched(onTouched) {
        this.onTouched = onTouched;
    }

    onBlur() {
        this.onTouched();
        this.blur.emit(this);
    }

    focusInput() {
        setTimeout(() => this.input.focus());
    }

    onChangeEvent(event) {
        let value = event;
        if (this.config && this.config.Options && this.config.Options.valueProperty) {
            value = _.get(event, this.config.Options.valueProperty);
        }
        this.onChange(value);
        this.formControl.setValue(value);
        this.lastValidValue = value;
        this.selectedItem = event;
        this.changeDetector.detectChanges();
    }
}
