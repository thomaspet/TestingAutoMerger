import {Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import {UniFieldLayout, KeyCodes} from '../../interfaces';
import {autocompleteDate} from '../../shared/autocompleteDate';
import {UniCalendar} from '../calendar';
import * as moment from 'moment';
import {Observable} from 'rxjs/Observable';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';


@Component({
    selector: 'uni-date-input',
    template: `
        <section class="uni-datepicker" (clickOutside)="close()">
            <input #input
               [attr.aria-describedby]="asideGuid"
                type="text"
                (change)="inputChange()"
                (focus)="onFocus()"
                [formControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                class="uni-datepicker-input" 
                [title]="control?.value || ''"
            />
            <button type="button"
                tabindex="-1"
                class="uni-datepicker-calendarBtn"
                (click)="calendarOpen = !calendarOpen"
                [disabled]="field?.ReadOnly"
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
export class DateTimePickerInput extends BaseControl {
    @ViewChild('input') private inputElement: ElementRef;
    @ViewChild(UniCalendar) private calendar: UniCalendar;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<DateTimePickerInput> = new EventEmitter<DateTimePickerInput>();
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<DateTimePickerInput> = new EventEmitter<DateTimePickerInput>();

    private calendarOpen: boolean;
    private selectedDate: Date;
    private options: any;

    constructor(private cd: ChangeDetectorRef) {
        super();
    }

    public ngOnChanges(changes) {
        if (this.field) {
            this.createControl();
            this.options = this.field.Options || {};
            let value = _.get(this.model, this.field.Property, '');

            if (value) {
                this.selectedDate = new Date(value);
                this.control.setValue(moment(this.selectedDate).format('L'));
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createOpenCloseListeners();
        this.createCalendarEvents();
    }

    private createOpenCloseListeners() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown');
        const f4AndSpaceEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.F4 || event.keyCode === KeyCodes.SPACE;
        });
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.ARROW_UP
                || event.keyCode === KeyCodes.ARROW_DOWN)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESC)
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

    public readMode() {
        this.field.ReadOnly = true;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    public inputChange() {
        const value = this.control.value;
        let date;

        if ((value && value.length) || this.options.autocompleteEmptyValue) {
            date = autocompleteDate(value) || null;
        } else {
            date = null;
        }

        this.dateSelected(date);
    }

    private dateSelected(date) {
        this.selectedDate = date;
        this.control.setValue(date ? moment(date).format('L') : '');
        let previousValue = _.get(this.model, this.field.Property);
        _.set(this.model, this.field.Property, date);
        this.emitChange(previousValue, date);
        this.emitInstantChange(previousValue, date, true);
    }

    private selectAndMove(date) {
        this.dateSelected(date);
        this.setFocusOnNextField();
    }

    private setFocusOnNextField() {
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
                    input.select();
                });

            }
        }
    }

    private findAncestor(element: HTMLElement, selector: string): HTMLElement {
        element = element.parentElement;
        while (element) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
    }

    private createCalendarEvents() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown')
        .filter(() => this.calendarOpen)
        .filter((event: KeyboardEvent) => !event.altKey);

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGEUP)
        .subscribe(() => this.calendar.nextMonth());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.PAGEDOWN)
        .subscribe(() => this.calendar.prevMonth());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ARROW_LEFT)
        .subscribe(() => this.calendar.prevDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ARROW_RIGHT)
        .subscribe(() => this.calendar.nextDay());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ARROW_UP)
        .subscribe(() => this.calendar.prevWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ARROW_DOWN)
        .subscribe(() => this.calendar.nextWeek());

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ENTER)
        .subscribe(() => {
            this.dateSelected(this.calendar.selectedDate.toDate());
            this.close();
        });
    }
}
