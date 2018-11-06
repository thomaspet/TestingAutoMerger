import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { autocompleteDate } from '@uni-framework/ui/uniform2/autocompleteDate';
import { LocalDate } from '@app/unientities';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { KeyCodes } from '@app/services/common/keyCodes';
import { CalendarInputComponent } from '@uni-framework/ui/uniform2/controls/date-input/calendar-input/calendar-input.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'uni-date-input2',
    templateUrl: './date-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: DateInputComponent, multi: true },
    ]
})
export class DateInputComponent implements OnInit, ControlValueAccessor {

    @Input() config;
    @Input() formControl: FormControl;
    @Output() focus: EventEmitter<DateInputComponent> = new EventEmitter();
    @Output() blur: EventEmitter<DateInputComponent> = new EventEmitter();
    @ViewChild('input') input: ElementRef;
    @ViewChild(CalendarInputComponent) calendar: CalendarInputComponent;
    onChange: (value: string) => void;
    onTouched: () => void;
    mainControl = new FormControl('', {updateOn: 'blur'});
    calendarOpen = false;
    selectedDate: moment.Moment;
    lastValidValue;

    constructor() { }

    ngOnInit() {
        // emit a change to the parent form
        this.mainControl.valueChanges.subscribe(x => {
            if (this.onChange) {
                if (x === '*') {
                    const today = moment(new Date(), 'L');
                    this.onChange(null);
                    this.mainControl.setValue(today, {
                        onlySelf: true,
                        emitEvent: false,
                        emitModelToViewChange: true,
                        emitViewToModelChange: true
                    });
                    this.selectedDate = today;
                    return;
                }
                if (this.config.Options.autocompleteEmptyValue) {
                    x = autocompleteDate(x, !!this.config.Options.denyYearInFuture);
                } else {
                    x = autocompleteDate(x);
                }
                this.lastValidValue = x;
                if (x === null) {
                    this.onChange(null);
                    this.mainControl.setValue('', {
                        onlySelf: true,
                        emitEvent: false,
                        emitModelToViewChange: true,
                        emitViewToModelChange: true
                    });
                    this.selectedDate = null;
                    return;
                }
                const date: moment.Moment = moment(x, 'L');
                const stringDate = date.format('L');
                this.mainControl.setValue(stringDate, {
                    onlySelf: true,
                    emitEvent: false,
                    emitModelToViewChange: true,
                    emitViewToModelChange: true
                });
                this.selectedDate = date;
                const local = (this.config && this.config.Options && this.config.Options.local === true);
                this.onChange(<any>(local ? new LocalDate(<Date>date.toDate()) : date));
            }
        });
    }

    ngAfterViewInit() {
        this.createCalendarEvents();
    }

    // used to initialize the component with the control value
    writeValue(value) {
        if (value) {
            if (value === '*') {
                this.selectedDate = moment(new Date());
            } else {
                this.selectedDate = moment(new Date(value));
            }
            this.lastValidValue = this.selectedDate;
            this.mainControl.setValue(moment(this.selectedDate).format('L'));
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

    close() {
        this.calendarOpen = false;
    }

    selectDate(date) {
        this.selectedDate = date;
        const value = moment(date).format('L');
        this.mainControl.setValue(value);
    }

    public createCalendarEvents() {
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
                this.mainControl.setValue(this.lastValidValue ? moment(this.lastValidValue).format('L') : '');
                this.close();
            });

        const keyDownEvent = fromEvent(this.input.nativeElement, 'keydown')
            .filter(() => this.calendarOpen)
            .filter((event: KeyboardEvent) => !event.altKey)

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGE_UP)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.calendar.nextMonth();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGE_DOWN)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => this.calendar.prevMonth());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.LEFT_ARROW)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => this.calendar.prevDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.RIGHT_ARROW)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => this.calendar.nextDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.UP_ARROW)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => this.calendar.prevWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.DOWN_ARROW)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => this.calendar.nextWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ENTER)
            .do((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
            })
            .subscribe(() => {
                this.selectDate(this.calendar.selectedDate);
                this.close();
            });
    }
}
