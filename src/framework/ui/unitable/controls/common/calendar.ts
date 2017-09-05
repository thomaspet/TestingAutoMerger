import {Component, Input, Output, EventEmitter, HostListener} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'unitable-calendar',
    template: `
        <table>
            <caption>
                <a class="prev" (click)="prevMonth()"></a>
                <label>{{calendarDate?.format('MMMM YYYY')}}</label>
                <a class="next" (click)="nextMonth()"></a>
            </caption>

            <thead>
                <tr>
                    <th *ngFor="let day of weekdays">{{day}}</th>
                </tr>
            </thead>

            <tbody>
                <tr *ngFor="let week of calendarWeeks; let outerIndex = index">
                    <td *ngFor="let weekday of week; let innerIndex = index"
                        (click)="dateSelected(weekday, outerIndex, innerIndex)"
                        [ngClass]="{
                            'other-month': weekday.month !== calendarDate.month(),
                            'selected': weekday.selected
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

    @Input()
    private config: any;

    @Output()
    private dateChange: EventEmitter<any> = new EventEmitter<any>();

    private weekdays: string[];
    private selectedDate: moment.Moment;
    private calendarDate: moment.Moment;
    private calendarWeeks: any[] = [];
    private isCtrlDown: boolean = false;
    private previousIndex: number[] = [];
    private monthHasChanged: boolean = false;

    constructor() {
        this.weekdays = (<any>moment).weekdaysMin(true);

        document.onkeydown = (e) => {
            if (e.keyCode === 17) {
                this.isCtrlDown = true;
            }
        };

        document.onkeyup = (e) => {
            if (e.keyCode === 17) {
                this.isCtrlDown = false;
            }
        }
    }

    public ngOnChanges() {
        this.selectedDate = moment(this.date || new Date());
        this.calendarDate = this.selectedDate.clone();
        this.generateCalendarPage(this.selectedDate);
    }

    @HostListener('click', ['$event'])
    public onClick(event) {
        // Avoid click bubbling up to document and causing clickOutside to run
        event.stopPropagation();
    }

    private generateCalendarPage(date: moment.Moment) {
        const daysInMonth = date.daysInMonth();
        const firstDayOfMonth = date.clone().startOf('month').weekday();
        let days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            if (i === new Date().getDate() && date.month() === new Date().getMonth()) {
                days.push({ day: i, month: date.month(), year: date.year(), selected: true });
            } else {
                days.push({ day: i, month: date.month(), year: date.year(), selected: false });
            }
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
            days.push({day: i, month: nextMonth, selected: false});
        }

        this.calendarWeeks = [];
        for (let i = 0; i <= 4; i++) {
            this.calendarWeeks[i] = days.splice(0, 7);
            for (var j = 0; j < this.calendarWeeks[i].length; j++) {
                if (this.calendarWeeks[i][j].selected) {
                    this.previousIndex = [i, j, this.calendarWeeks[i][j].month];
                }
            }
        }
    }

    public dateSelected(date, week, day) {
        // Make this previous selected date
        let firstDate = this.selectedDate.clone();

        // Remove all selected
        this.calendarWeeks.forEach((calendarWeek: any[]) => {
            calendarWeek.forEach((calendarDay: any) => {
                calendarDay.selected = false;
            });
        });

        this.selectedDate.year(date.year);
        this.selectedDate.month(date.month);
        this.selectedDate.date(date.day);

        this.calendarWeeks[week][day].selected = true;
        this.calendarDate = this.selectedDate.clone();

        // If CTRL is down and calendarconfig is sent in
        if (this.isCtrlDown && this.config && this.config.allowSelection) {

            // Change firstdate to first visible date in calender if month has changed
            if (this.monthHasChanged) {
                this.previousIndex = [0, 0, date.month];
                firstDate.year(this.calendarWeeks[0][0].year);
                firstDate.month(this.calendarWeeks[0][0].month);
                firstDate.date(this.calendarWeeks[0][0].day);
            }

            let firstSelected = [week, day];
            let lastSelected = [this.previousIndex[0], this.previousIndex[1]];

            if ((firstSelected[0] * 10) + firstSelected[1] > (lastSelected[0] * 10) + lastSelected[1]) {
                let temp = firstSelected;
                firstSelected = lastSelected;
                lastSelected = temp;
            }

            // Loop all the days from startDay to endDay and mark them as selected
            for (var weekIndex = firstSelected[0]; weekIndex <= lastSelected[0]; weekIndex++) {
                for (var dayIndex = 0; dayIndex < 7; dayIndex++) {

                    // If startday is not a monday, start first iteration at startDay
                    if (weekIndex === firstSelected[0] && dayIndex === 0 && firstSelected[1] !== 0) {
                        dayIndex = firstSelected[1];
                    }

                    this.calendarWeeks[weekIndex][dayIndex].selected = true;

                    // When reaching endDay, break out  of for loop..
                    if (weekIndex === lastSelected[0] && dayIndex === lastSelected[1]) {
                        break;
                    }
                }
            }


            this.dateChange.emit({ date: this.selectedDate.toDate(), firstDate: firstDate.toDate() });
        } else {
            this.dateChange.emit(this.selectedDate.toDate());
        }

        this.previousIndex = [week, day, date.month];
        this.monthHasChanged = false;
    }

    public prevMonth() {
        this.monthHasChanged = true;
        this.calendarDate.subtract(1, 'month');
        this.generateCalendarPage(this.calendarDate);
    }

    public nextMonth() {
        this.monthHasChanged = true;
        this.calendarDate.add(1, 'month');
        this.generateCalendarPage(this.calendarDate);
    }


}
