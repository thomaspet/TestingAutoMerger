import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { KeyCodes } from '@app/services/common/keyCodes';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { UniSearch } from '@uni-framework/ui/unisearch';
import * as _ from 'lodash';

@Component({
    selector: 'uni-search-input2',
    templateUrl: './unisearch-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: UniSearchInputComponent, multi: true },
    ]
})
export class UniSearchInputComponent implements ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<UniSearchInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<UniSearchInputComponent> = new EventEmitter();
    @ViewChild('input') input: UniSearch;
    onChange: (value: string) => void;
    onTouched: () => void;
    lastValidValue;

    constructor() { }

    ngAfterViewInit() {
        const input = this.input.NativeInput;
        fromEvent(input, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.DELETE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.config.Options.uniSearchConfig.initialItem$.next('');
            });
        fromEvent(input, 'keydown')
            .filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESCAPE)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.config.Options.uniSearchConfig.initialItem$.next(this.lastValidValue);
            });
        fromEvent(input, 'focus')
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.focus.emit(this);
            });
    }

    // used to initialize the component with the control value
    writeValue(value) {
        if (typeof this.config.Options.source === 'string') {
            this.config.Options.uniSearchConfig.initialItem$.next(value);
            this.lastValidValue = value;
        } else if (typeof this.config.Options.source === 'function') {
            this.config.Options.source(value).subscribe(source => {
                this.lastValidValue = source;
                this.config.Options.uniSearchConfig.initialItem$.next(source);
            });
        } else if (value && this.config.property.endsWith('ID')) {
            this.config.Options.uniSearchConfig.onSelect({ID: value})
                .subscribe(expandedModel => {
                    this.config.options.uniSearchConfig.initialItem$.next(expandedModel);
                    this.lastValidValue = this.config.options.valueProperty
                        ? _.get(expandedModel, this.config.options.valueProperty)
                        : expandedModel;
                });
        } else {
            this.config.Options.uniSearchConfig.initialItem$.next(value);
            this.lastValidValue = value;
        }
    }

    // this function is always this way.
    registerOnChange(onChange: (value: string) => void) {
        this.onChange = onChange;
    }

    // this function is alwas this way
    registerOnTouched(onTouched) {
        this.onTouched = onTouched;
    }

    onChangeEvent(value) {
        if (this.onChange) {
            console.log('change');
            if (this.config.Options.valueProperty) {
                value = _.get(value, this.config.Options.valueProperty);
            }
            this.lastValidValue = value;
            this.formControl.setValue(value);
            // I can't find why onChange doesn't work. To fix that I get the parent control and update the value.
            // this.onChange(value);
        }
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
