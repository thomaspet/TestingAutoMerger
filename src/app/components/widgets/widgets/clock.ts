import { Component, ChangeDetectorRef } from '@angular/core';
import { IUniWidget } from '../uniWidget';
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
            </div>
        </div>`
})

export class UniClockWidget {
    public widget: IUniWidget;

    private updateInterval: any;
    private day: string;
    private date: string;
    private time: string;

    constructor(cdr: ChangeDetectorRef) {
        this.updateInterval = setInterval(() => {
            const date = moment();
            this.day = date.format('dddd');
            this.date = date.format('Do MMM');
            this.time = this.widget.config.showSeconds
                ? date.format('HH:mm:ss') : date.format('HH:mm');

            cdr.markForCheck();
        }, 1000);
    }

    public ngAfterViewInit() {
        if (this.widget) {

        }
    }

    public ngOnDestroy() {
        clearInterval(this.updateInterval);
    }
}
