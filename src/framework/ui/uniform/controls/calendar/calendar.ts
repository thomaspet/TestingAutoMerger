import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'uni-calendar',
    templateUrl: './calendar.html'
})
export class UniCalendar implements OnChanges {
    @Input() private date: Date;
    @Output() private dateChange: EventEmitter<Date> = new EventEmitter<Date>();

    private weekdays: string[];
    public selectedDate: moment.Moment;
    private calendarDate: moment.Moment;
    private calendarWeeks: any[] = [];

    constructor() {
        this.weekdays = moment.weekdaysMin(true);
    }

    public ngOnChanges() {
        this.selectedDate = moment(this.date || new Date());
        this.calendarDate = this.selectedDate.clone();
        this.generateCalendarPage(this.selectedDate);
    }

    private generateCalendarPage(date: moment.Moment) {
        const daysInMonth = date.daysInMonth();
        const firstDayOfMonth = date.clone().startOf('month').weekday();
        const days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({day: i, month: date.month(), year: date.year()});
        }

        // If first day is not monday, add days from previous month until we fill the week
        if (firstDayOfMonth !== 0) {
            const numDaysLastMonth = date.clone().subtract(1, 'month').endOf('month').date();
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.unshift({day: (numDaysLastMonth - i), month: (date.month() - 1)});
            }
        }

        // Fill with next months dates until we have a full calendar page (42)
        const nextMonth = date.month() + 1;
        const numDaysFromNextMonth = 42 - days.length;
        for (let i = 1; i <= numDaysFromNextMonth; i++) {
            days.push({day: i, month: nextMonth});
        }

        this.calendarWeeks = [];
        for (let i = 0; i <= 5; i++) {
            this.calendarWeeks[i] = days.splice(0, 7);
        }
    }

    private dateSelected(date) {
        this.selectedDate.year(date.year);
        this.selectedDate.month(date.month);
        this.selectedDate.date(date.day);
        this.calendarDate = this.selectedDate.clone();
        this.dateChange.emit(this.selectedDate.toDate());
    }

    public prevMonth() {
        this.calendarDate.subtract(1, 'month');
        this.generateCalendarPage(this.calendarDate);
    }

    public nextMonth() {
        this.calendarDate.add(1, 'month');
        this.generateCalendarPage(this.calendarDate);
    }

    public prevDay() {
        const month = this.selectedDate.month();
        this.selectedDate = this.selectedDate.subtract(1, 'd');
        const prevMonth = this.selectedDate.month();
        if (month !== prevMonth) {
            this.prevMonth();
        }
        this.calendarDate = this.selectedDate.clone();
    }

    public nextDay() {
        const month = this.selectedDate.month();
        this.selectedDate = this.selectedDate.add(1, 'd');
        const nextMonth = this.selectedDate.month();
        if (month !== nextMonth) {
            this.nextMonth();
        }
        this.calendarDate = this.selectedDate.clone();
    }

    public prevWeek() {
        const month = this.selectedDate.month();
        this.selectedDate = this.selectedDate.subtract(7, 'd');
        const prevMonth = this.selectedDate.month();
        if (month !== prevMonth) {
            this.prevMonth();
        }
        this.calendarDate = this.selectedDate.clone();
    }

    public nextWeek() {
        const month = this.selectedDate.month();
        this.selectedDate = this.selectedDate.add(7, 'd');
        const nextMonth = this.selectedDate.month();
        if (month !== nextMonth) {
            this.nextMonth();
        }
        this.calendarDate = this.selectedDate.clone();
    }
}
