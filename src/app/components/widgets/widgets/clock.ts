import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import * as moment from 'moment';

@Component({
    selector: 'uni-clock',
    template: `
        <div class="uni-widget-clock">
            <div class="uni-widget-clock-date" [ngStyle]="{'background-color': widget.config.dateColor}">
                <h3>{{day}}</h3>
                <h3>{{date}}</h3>
            </div>

            <div class="uni-widget-clock-time" [ngClass]="{'long-time': widget?.config?.showSeconds}">
                <span>{{time}}</span>
                <span *ngIf="widget?.config?.showSeconds">{{sec}}</span>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniClockWidget {
    public widget: IUniWidget;
    private updateInterval: any;
    private day: string;
    private date: string;
    private time: string;
    private sec: string;

    constructor(private cdr: ChangeDetectorRef) {
        this.setDateAndTime();

        this.updateInterval = setInterval(() => {
            this.setDateAndTime();
        }, 1000);
    }

    public ngOnDestroy() {
        clearInterval(this.updateInterval);
    }

    private setDateAndTime() {
        const date = moment();
        this.day = date.format('dddd').replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        this.date = date.format('Do MMM');
        this.time = date.format('HH:mm');
        this.sec = date.format(':ss');

        this.cdr.markForCheck();
    }
}
