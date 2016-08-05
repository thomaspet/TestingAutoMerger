import {Component, Input, Output, EventEmitter} from '@angular/core';
import moment from 'moment';

@Component({
    selector: 'uni-calendar',
    template: `
        <table>
            <caption>
                <a class="prev" (click)="prevMonth()"></a>
                <label>{{selectedDate?.format('MMMM YYYY')}}</label>
                <a class="next" (click)="nextMonth()"></a>
            </caption>

            <thead>
                <tr>
                    <th *ngFor="let day of weekdays">{{day}}</th>
                </tr>
            </thead>

            <tbody>
                <tr *ngFor="let week of calendarWeeks">
                    <td *ngFor="let weekday of week"
                        (click)="dateSelected(weekday)"
                        [ngClass]="{
                            'other-month': weekday.month !== selectedDate.month(),
                            'selected': weekday.day === selectedDate.date() && weekday.month === selectedDate.month()
                        }">
                        {{weekday.day}}
                    </td>
                </tr>
            </tbody>
        </table>
    `
})
export class UniCalendar {
    @Input()
    private date: Date;

    @Output()
    private dateChange: EventEmitter<Date> = new EventEmitter<Date>();

    private weekdays: string[];
    private selectedDate: moment.Moment;
    private calendarWeeks: any[] = [];

    constructor() {
        this.weekdays = moment.weekdaysMin(true);
    }

    public ngOnChanges() {
        this.selectedDate = moment(this.date);
        this.generateCalendarPage(this.selectedDate);
    }

    private generateCalendarPage(date: moment.Moment) {
        const daysInMonth = date.daysInMonth();
        const firstDayOfMonth = date.startOf('month').weekday();
        let days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({day: i, month: date.month()});
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
        this.selectedDate.month(date.month);
        this.selectedDate.date(date.day);
        this.dateChange.emit(this.selectedDate.toDate());
    }

    private prevMonth() {
        this.selectedDate.subtract(1, 'month');
        this.generateCalendarPage(this.selectedDate);
    }

    private nextMonth() {
        this.selectedDate.add(1, 'month');
        this.generateCalendarPage(this.selectedDate);
    }


}
