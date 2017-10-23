import {Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import {UniFieldLayout} from '../../interfaces';
import {autocompleteDate} from '../../shared/autocompleteDate';
import {UniCalendar} from '../calendar';
import * as moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';
import {KeyCodes} from '../../../../../app/services/common/keyCodes';
import {LocalDate} from '../../../../../app/unientities';

@Component({
    selector: 'localdate-picker-input',
    template: `
        <section class="uni-datepicker" (clickOutside)="close()">
            <input #input
                [attr.aria-describedby]="asideGuid"
                type="text"
                (change)="inputChange()"
                (focus)="onFocus()"
                [formControl]="control"
                [readonly]="readOnly$ | async"
                [placeholder]="field?.Placeholder || ''"
                class="uni-datepicker-input"
                [title]="control?.value || ''"
            />
            <button type="button"
                tabindex="-1"
                class="uni-datepicker-calendarBtn"
                (click)="calendarOpen = !calendarOpen"
                [disabled]="readOnly$ | async"
                (focus)="focus()"
            >Kalender</button>

            <ng-content></ng-content>

            <uni-calendar [attr.aria-expanded]="calendarOpen"
                          [date]="selectedDate"
                          (dateChange)="selectAndMove($event)">
            </uni-calendar>
        </section>
    `
})
export class LocalDatePickerInput extends BaseControl{
    @ViewChild('input') public inputElement: ElementRef;
    @ViewChild(UniCalendar) public calendar: UniCalendar;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<LocalDatePickerInput> = new EventEmitter<LocalDatePickerInput>();
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<LocalDatePickerInput> = new EventEmitter<LocalDatePickerInput>();

    public calendarOpen: boolean;
    public selectedDate: Date;
    public options: any;

    constructor(public cd: ChangeDetectorRef) {
        super();
    }

    public ngOnChanges(changes) {
        this.createControl();
        if (this.control && this.field) {
            this.options = this.field.Options || {};
            let value = <any>_.get(this.model, this.field.Property);

            if (value) {
                if (value === '*') {
                    this.selectedDate = new Date();
                } else {
                    this.selectedDate = new Date(value);
                }
                this.control.setValue(moment(this.selectedDate).format('L'));
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createOpenCloseListeners();
        this.createCalendarEvents();
    }

    public createOpenCloseListeners() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown');
        const f4AndSpaceEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.F4 || event.keyCode === KeyCodes.SPACE;
        });
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.UP_ARROW
                || event.keyCode === KeyCodes.DOWN_ARROW)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESCAPE)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.close();

            });
    }

    public open() {
        this.calendarOpen = true;
        this.cd.markForCheck();
    }

    public close() {
        this.calendarOpen = false;
        this.cd.markForCheck();
    }

    public toggle() {
        if (!this.calendarOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    public onFocus() {
        this.focusEvent.emit(this);
    }

    public focus() {
        this.inputElement.nativeElement.focus();
        this.inputElement.nativeElement.select();
    }

    public inputChange() {
        const value = this.control.value;
        let date;

        if ((value && value.length) || this.options.autocompleteEmptyValue) {
            if (value === '*') {
                date = new Date();
            } else {
                date = autocompleteDate(value) || null;
            }
        } else {
            date = null;
        }

        this.dateSelected(date);
    }

    public dateSelected(date) {
        this.selectedDate = date;
        this.control.setValue(date ? moment(date).format('L') : '');
        let previousValue = _.get(this.model, this.field.Property) || null;
        if (typeof previousValue === 'string') {
            previousValue = new LocalDate(previousValue);
        }
        _.set(this.model, this.field.Property, date && new LocalDate(date));
        this.emitChange(previousValue, date && new LocalDate(date));
        this.emitInstantChange(previousValue, date && new LocalDate(date), !!date);
    }

    public selectAndMove(date) {
        this.dateSelected(date);
        this.close();
        this.setFocusOnNextField();
    }

    public setFocusOnNextField() {
        const uniFieldParent = this.findAncestor(this.inputElement.nativeElement, 'uni-field');
        if (!uniFieldParent) {
            return;
        }
        let nextUniField = uniFieldParent.nextElementSibling;
        if (nextUniField) {
            if (nextUniField.tagName === 'UNI-LINEBREAK') {
                nextUniField = nextUniField.nextElementSibling;
            }
            const input = <HTMLInputElement>nextUniField.querySelector('input,textarea,select,button');
            if (input) {
                setTimeout(() => {
                    input.focus();
                    if (input.tagName.toLowerCase() !== 'button') {
                        input.select();
                    }
                });

            }
        }
    }

    public findAncestor(element: HTMLElement, selector: string): HTMLElement {
        element = element.parentElement;
        while (element) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
    }

    public createCalendarEvents() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown')
        .filter(() => this.calendarOpen)
        .filter((event: KeyboardEvent) => !event.altKey);

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGE_UP)
        .subscribe(() => this.calendar.nextMonth());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGE_DOWN)
        .subscribe(() => this.calendar.prevMonth());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.LEFT_ARROW)
        .subscribe(() => this.calendar.prevDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.RIGHT_ARROW)
        .subscribe(() => this.calendar.nextDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.UP_ARROW)
        .subscribe(() => this.calendar.prevWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.DOWN_ARROW)
        .subscribe(() => this.calendar.nextWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ENTER)
        .subscribe(() => {
            this.dateSelected(this.calendar.selectedDate.toDate());
            this.close();
        });
    }
}
