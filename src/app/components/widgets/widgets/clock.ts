import { Component } from '@angular/core';
import { IUniWidget } from '../uniWidget';

@Component({
    selector: 'uni-clock',
    template: `
                <div class="uni-widget-clock">
                    <div class="uni-widget-clock-date" [ngStyle]="{'background-color': widget.config.dateColor}"> <h3>{{ date.day }}</h3>  <h3>{{ date.date }}</h3></div>
                    <div class="uni-widget-clock-time" id="uni-widget-clock-time-container">
                        <span id="hours" class="timer_display">00</span>
                        <span class="timer_display"> : </span>
                        <span id="minutes" class="timer_display">00</span>
                        <span class="timer_display" *ngIf="widget.config.showSeconds"> : </span>
                        <span id="seconds" class="timer_display" *ngIf="widget.config.showSeconds">00</span>
                    </div>    
                </div>`
})

export class UniClockWidget {

    public widget: IUniWidget;
    public date: any = {};
    public hours: any;
    public minutes: any;
    public seconds: any;
    public myInterval: any;
    public days: string[] = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    public MONTHS_SHORT_SMALL: string[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    constructor() { }

    public ngAfterViewInit() {
        if (this.widget) {
            this.loadClockWidget();
            this.initiateClock();
        }
    }

    private loadClockWidget() {
        this.date.day = this.days[new Date().getDay()];
        this.date.date = new Date().getDate() + '. ' + this.MONTHS_SHORT_SMALL[new Date().getMonth()];
    }

    private initiateClock() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.seconds = new Date().getSeconds();

        document.getElementById('minutes').innerText = (this.minutes < 10 ? "0" : "") + this.minutes;
        document.getElementById('hours').innerText = (this.hours < 10 ? '0' : '') + this.hours;

        if (this.widget.config.showSeconds) {
            document.getElementById('seconds').innerText = this.seconds = (this.seconds < 10 ? "0" : "") + this.seconds;
            //Make fontsize smaller when seconds is shown..
            var list = document.getElementById('uni-widget-clock-time-container').getElementsByTagName('span');
            for (var i = 0; i < list.length; i++) {
                list[i].style.fontSize = '3rem';
            }
            this.myInterval = setInterval(() => {
                this.tickSecond();
            }, 1000);
        } else {
            this.myInterval = setInterval(() => {
                this.tickInvisibleSecond();
            }, 1000)
        }
    }

    private tickSecond() {
        if (this.seconds >= 59) {
            this.seconds = 0;
            this.tickMinute();
        } else {
            this.seconds++;
        }
        if (this.widget.config.showSeconds) {
            this.seconds = (this.seconds < 10 ? "0" : "") + this.seconds;
            document.getElementById('seconds').innerText = this.seconds;
        }
    }

    private tickInvisibleSecond() {
        if (this.seconds >= 59) {
            this.seconds = 0;
            this.tickMinute();
        } else {
            this.seconds++;
        }
    }

    private tickMinute() {
        if (this.minutes >= 59) {
            this.tickHour();
            this.minutes = 0;
        } else {
            this.minutes++;
        }
        this.minutes = (this.minutes < 10 ? "0" : "") + this.minutes;
        document.getElementById('minutes').innerText = this.minutes;
    }

    private tickHour() {
        if (this.hours >= 23) {
            this.hours = 0;
        } else {
            this.hours++;
        }

        this.hours = (this.hours < 10 ? '0' : '') + this.hours;
        document.getElementById('hours').innerText = this.hours;
    }

    private ngOnDestroy() {
        clearInterval(this.myInterval);
    }
}