import {Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'daybrowser',
    template: `<article class="daybrowser centered" >
        <header>
            <span class="subtitle">
                <time [attr.datetime]="">{{fromNow()}}</time>
            </span>
            <span class="monthbutton" (click)="onOpenCalendar()">{{day.date|isotime:'UMMMM YYYY'}}</span>
            <span class="subtitle">Uke {{day.isoWeek}}</span>
            <div class="popup-calendar" *ngIf="calendarOpen" >
                <unitable-calendar 
                (clickOutside)="onCalBlur()" (dateChange)="onCalendarDateChange($event)" 
                (keydown.esc)="hideCalendar()"
                [date]="day.date"></unitable-calendar>
            </div>
        </header>
        <table>
            <tr>
                <td (click)="onNavigate('left')" class="arrow"><div class="arrow-left"></div></td>
                <td><table><tr>
                    <td [class.is-active]="day.selected" [class.is-weekend]="day.isWeekend" 
                    *ngFor="let day of days" (click)="onClick(day)">
                        <span class="small">{{day.date|isotime:'Udddd'}}</span>
                        <span [class.circle]="day.isToday" class="big">{{day.date|isotime:'D'}}</span>
                        <span class="small">{{day.counter|min2hours:'decimal-'}}</span>
                    </td>
                    </tr></table>
                </td>
                <td (click)="onNavigate('right')" class="arrow"><div class="arrow-right"></div></td>
            </tr>
        </table>
    </article>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayBrowser {
    public days: Array<Day> = [];
    public weekNumber: number;
    private day: Day;
    private numDayCounter: number = 0;
    private ignoreNextBlur: boolean = true;
    private calendarOpen: boolean = false;

    @Output() public clickday: EventEmitter<Day> = new EventEmitter();
    @Output() public requestsums: EventEmitter<ITimeSpan> = new EventEmitter();
    @Output() public navigate: EventEmitter<INavDirection> = new EventEmitter();

    constructor(private changeDetectorRef: ChangeDetectorRef) {
        this.days = this.initWeekByDay( new Day(new Date() ) ); // new Date() );
    }

    public fromNow() {
        var dt = this.day.mDate;
        var now = moment();
        dt.add(now.hours(), 'hours');
        dt.add(now.minutes(), 'minutes');
        dt.add(now.seconds(), 'seconds');
        if (now.isSame(dt, 'day')) {
            return 'I dag';
        }
        return dt.fromNow();
    }

    public get current(): Day {
        return this.day;
    }

    public set current(day: Day) {
        this.day = day;
        this.setDay(day);
    }

    public onClick(day: Day) {
        this.clickday.emit(day);
    }

    public onCalBlur() {
        if (!this.ignoreNextBlur) {
            this.hideCalendar();
        }
        this.ignoreNextBlur = false;
    }

    public onOpenCalendar() {
        this.ignoreNextBlur = true;
        this.calendarOpen = true;
    }

    public hideCalendar() {
        this.calendarOpen = false;
    }

    public onCalendarDateChange(date: Date) {
        this.clickday.emit(new Day(date));
        this.hideCalendar();
    }

    public reloadSums() {
        this.emitRequestSums( this.days[0].date, this.days[this.days.length - 1].date ); 
    }

    public onNavigate(direction: 'right'|'left') {
        this.navigate.emit({ 
            currentDate: this.day.date, 
            leftDate: this.days[0].date, 
            rightDate: this.days[this.days.length - 1].date,
            directionLeft: direction === 'left', 
            daysInView: this.days.length
        });
    }

    public setDay(day: Day) {
        var match = this.days.findIndex( x => x.isSame(day));
        if (match >= 0) {
            this.days.forEach( x => x.selected = false );
            day.updated = true;
            day.selected = true;
            this.days[match] = day;
            this.checkDaySums();
        } else {            
            this.days = this.initWeekByDay(day);
        }
        this.refresh();
    }

    private refresh() {
        this.changeDetectorRef.markForCheck();
    }

    private checkDaySums() {
        if (this.numDayCounter < this.days.length) {
            this.emitRequestSums( this.days[0].date, this.days[this.days.length - 1].date ); 
        }        
    }

    private emitRequestSums(fromDate: Date, toDate: Date) {
        this.requestsums.emit({ fromDate: fromDate, toDate: toDate });
    }

    public setDayCounter(date: Date, counter: number) {
        var dx = new Day(date);
        var match = this.days.findIndex( x => x.isSame(dx));
        if (match >= 0) {
            var newDay = this.days[match].clone();
            newDay.counter = counter;
            if (!newDay.updated) {
                newDay.updated = true;
                this.numDayCounter++;
            }
            this.days[match] = newDay;
        }
        this.refresh();
    }

    public setDaySums(list: Array<any>, dateCol: string, ...sumCols: string[]) {
        list.forEach( item => {
            var sum = 0;
            sumCols.forEach( y => { if (item[y]) { sum += item[y]; } } );
            this.setDayCounter(item[dateCol], sum); 
        });
        this.numDayCounter = this.days.length;
        this.refresh();
    }

    private initWeekByDay(day: Day): Array<Day> {
        var wk = [];        
        var weekDay = day.mDate;
        var orgDate = weekDay.clone();
        weekDay.add('days', -orgDate.isoWeekday());
        this.weekNumber = weekDay.isoWeek();
        for (var i = 0; i < 7; i++) {
            weekDay.add('days', 1);
            let isSame = weekDay.isSame(orgDate);
            let dd = new Day(weekDay.toDate(), isSame);            
            wk.push( isSame ? day : dd );
        }
        this.day = day;
        day.updated = true;
        this.numDayCounter = 1;
        this.emitRequestSums(wk[0].date, wk[wk.length - 1].date);
        return wk; 
    }

}

export class Day {
    public date: Date;
    public updated: boolean = false;
    public isToday: boolean = false;
    public isWeekend: boolean = false;
    public isoWeek: number = 0;
    constructor(date?: Date, public selected: boolean = false, public counter: number = 0) {
        this.date = Day.removeTime(date ||  new Date());
        let dt = moment(this.date);
        this.isToday = dt.isSame(moment(), 'day');
        this.isWeekend = dt.isoWeekday() > 5;
        this.isoWeek = dt.isoWeek();
    }
    public get mDate(): moment.Moment {
        return moment(this.date);
    }
    public isSame(day: Day): boolean {
        if (!day) { return false; }
        return moment(day.date).isSame(moment(this.date));
    }
    private static removeTime(date: Date): Date {
        return moment(date).startOf('day').toDate();
    }
    public clone() {
        var d = new Day(this.date, this.selected, this.counter);
        d.updated = this.updated;
        return d;
    }
}

export interface ITimeSpan {
    fromDate: Date;
    toDate: Date;
}

export interface INavDirection {
    currentDate: Date;
    leftDate: Date;
    rightDate: Date;
    daysInView: number;
    directionLeft: boolean;
}
