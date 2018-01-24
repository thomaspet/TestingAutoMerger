import {Component, Input, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as moment from 'moment';
import {DateUtil} from '../common/DateUtil';


@Component({
    selector: 'unitable-datepicker',
    template: `
        <section class="uni-datepicker">
            <input #input type="text"
                (change)="inputChange()"
                (keydown)="onKeyDown($event)"
                [formControl]="inputControl"
                class="uni-datepicker-input" />

            <button class="uni-datepicker-calendarBtn"
                    (click)="toggleCalendar()"
                    (keydown.esc)="onKeyDown($event)"
                    tabIndex="-1">Kalender</button>
            <unitable-calendar [attr.aria-expanded]="expanded"
                          [date]="calendarDate"
                          (dateChange)="dateSelected($event)"
                          (keydown.esc)="onKeyDown($event)">
            </unitable-calendar>
        </section>
    `
})
export class UnitableDateTimepicker {
    @ViewChild('input')
    public inputElement: ElementRef;

    @Input()
    private inputControl: FormControl;

    public expanded: boolean;
    private selectedDate: Date;
    private calendarDate: Date;

    constructor(private dateUtil: DateUtil) {}

    public getValue() {
        if (this.selectedDate) {
            return this.selectedDate;
        } else {
            if (this.inputControl.dirty) {
                return this.dateUtil.autocompleteDate(this.inputControl.value || '');
            } else {
                return undefined;
            }
        }
    }

    private inputChange() {
        const value = this.inputControl.value;
        let date;

        if (value && value.length) {
            if (value === '*') {
                date = new Date();
            } else {
                date = this.dateUtil.autocompleteDate(value) || null;
            }
        }

        this.selectedDate = date;
    }

    public toggleCalendar() {
        if (this.expanded) {
            this.expanded = false;
        } else {
            this.calendarDate = this.dateUtil.autocompleteDate(this.inputControl.value);
            this.expanded = true;
        }
    }

    private dateSelected(date) {
        this.selectedDate = date;
        this.calendarDate = new Date(date);

        if (date) {
            this.inputControl.setValue(moment(date).format('DD.MM.YYYY'));
        } else {
            this.inputControl.setValue('');
        }

        this.expanded = false;
        this.inputElement.nativeElement.focus();
    }

    public onKeyDown(event: KeyboardEvent) {
        const key = event.which || event.keyCode;

        if (key === 27 && this.expanded) {
            event.preventDefault();
            event.stopPropagation();
            this.expanded = false;
            this.inputElement.nativeElement.focus();
        } else if (key === 32 && !this.inputControl.value.length) {
            event.preventDefault();
            this.expanded = true;
        } else if (key === 115 || (key === 40 && event.altKey)) {
            this.expanded = true;
        }
    }

}

