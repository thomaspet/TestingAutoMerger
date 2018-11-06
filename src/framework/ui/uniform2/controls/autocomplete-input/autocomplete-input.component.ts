import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    ElementRef, ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { AutocompleteListComponent } from '@uni-framework/ui/uniform2/controls/autocomplete-input/autocomplete-list.component';
import { debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { KeyCodes } from '@app/services/common/keyCodes';

@Component({
    selector: 'uni-autocomplete-input2',
    templateUrl: './autocomplete-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: AutocompleteInputComponent, multi: true },
    ]
})
export class AutocompleteInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() source;
    @Input() formControl: FormControl;

    @Output() focus: EventEmitter<AutocompleteInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<AutocompleteInputComponent> = new EventEmitter();

    @ViewChild('query') queryInput: ElementRef;
    @ViewChild('btn') toggleButton: ElementRef;
    @ViewChild('list') list: AutocompleteListComponent;

    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('');
    expanded = false;
    filter;
    selectedItem: any;
    host = this;
    busy = false;
    lastValidValue;

    constructor(public changeDetector: ChangeDetectorRef) { }

    ngOnInit() {
        this.mainControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
                this.filter = value;
                this.changeDetector.detectChanges();
        });
        const onPressEsc = fromEvent(this.queryInput.nativeElement, 'keydown')
            .pipe(filter((event: KeyboardEvent) => event.which === KeyCodes.ESCAPE));

        onPressEsc.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();
            this.writeValue(this.lastValidValue);
            this.expanded = false;
            this.changeDetector.detectChanges();
        });
    }

    // used to initialize the component with the control value
    writeValue(value) {
        this.lastValidValue = value;
        const templateFn = this.config && this.config.Options && this.config.Options.template;
        const initialValueFn = this.config && this.config.Options && this.config.Options.initialValueFn;

        let fnResult;
        if (initialValueFn) {
            fnResult = initialValueFn(value);
        } else {
            const source = this.config && this.config.Options && this.config.Options.source;
            const valueFn = (val) => {
                const property = (this.config && this.config.Options && this.config.Options.valueProperty) || 'ID';
                return source.find(elem => _.get(elem, property) === val);
            };
            fnResult = valueFn(value);
        }
        const fnIsPromise = (!!fnResult && fnResult.then);
        const fnIsObs = (!!fnResult && fnResult.subscribe);

        let fnResultToObs;
        if (fnIsPromise) {
            fnResultToObs = fromPromise(fnResult);
        }
        if (fnIsObs) {
            fnResultToObs = fnResult;
        }
        if (!fnIsObs && !fnIsPromise) {
            fnResultToObs = of(fnResult);
        }
        fnResultToObs.subscribe(result => {
            if (templateFn) {
                result = templateFn(result);
            }
            this.mainControl.setValue(result, {
                onlySelf: true,
                emitEvent: false,
                emitModelToViewChange: true,
                emitViewToModelChange: true
            });
        });
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
        this.onSelect(this.selectedItem);
        this.blur.emit(this);
    }

    focusInput() {
        setTimeout(() => this.queryInput.nativeElement.focus());
    }

    onClickOutside() {
        this.expanded = false;
        this.changeDetector.detectChanges();
    }

    onSelect(item) {
        this.selectedItem = item;
        let value = item;
        if (this.config && this.config.Options && this.config.Options.template) {
            value = this.config.Options.template(item);
        }
        this.mainControl.setValue(value, {
            onlySelf: false,
            emitEvent: false,
            emitModelToViewChange: true,
            emitViewToModelChange: true
        });
        if (this.config && this.config.Options && this.config.Options.valueProperty) {
            item = _.get(item, this.config.Options.valueProperty);
        }
        this.lastValidValue = item;
        this.onChange(item);
        this.expanded = false;
        this.changeDetector.detectChanges();
    }

    search() {
        this.list.search();
    }

    onSearchStart() {
        this.busy = true;
        this.changeDetector.detectChanges();
    }
    onSearchEnd() {
        this.busy = false;
        this.changeDetector.detectChanges();
    }
    onExpand(value) {
        this.expanded = value;
    }
}
