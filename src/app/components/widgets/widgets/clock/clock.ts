import {Component, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {IUniWidget} from '../../uniWidget';
import {interval, Subscription} from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'uni-clock',
    template: `
        <div class="clock-date-section">
            <span class="day">{{day}}</span>
            <span class="date">{{date}}</span>
        </div>

        <div class="clock-time-section">
            <span>{{time}}</span>
        </div>
    `,
    styleUrls: ['./clock.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniClockWidget {
    widget: IUniWidget;

    day: string;
    date: string;
    time: string;

    private updateSubscription: Subscription;

    constructor(private cdr: ChangeDetectorRef) {
        this.setDateAndTime();
        this.updateSubscription = interval(1000).subscribe(() => this.setDateAndTime());
    }

    public ngOnDestroy() {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }

    private setDateAndTime() {
        const date = moment();
        this.day = date.format('dddd').replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        this.date = date.format('Do MMM');
        this.time = date.format('HH:mm');

        this.cdr.markForCheck();
    }
}
