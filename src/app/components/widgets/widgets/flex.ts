import { Component } from '@angular/core';
import { WidgetDataService } from '../widgetDataService';
import { IUniWidget } from '../uniWidget';
import { Router } from '@angular/router';
import {AuthService} from '../../../../framework/core/authService';
import {WorkerService, TimesheetService} from '../../../services/services';
import * as moment from 'moment';

@Component({
    selector: 'uni-flex',
    template: `
        <div class="positive-negative-widget"
             [ngClass]="negative ? 'negative' : 'positive'"
             (click)="onClickNavigate()"
             title="Totalsum flexiid">

            <span class="title">timesaldo</span>
            <span class="value">{{displayValue}}</span>
        </div>
    `
})
export class UniFlexWidget {
    public widget: IUniWidget;

    private displayValue: string;
    private negative: boolean;

    constructor(
        private widgetDataService: WidgetDataService,
        private router: Router,
        private authService: AuthService,
        private workerService: WorkerService,
        private timesheetService: TimesheetService
    ) {}

    public ngAfterViewInit() {
        this.timesheetService.initUser().subscribe((timesheet) => {
            if (timesheet && timesheet.currentRelation) {
                this.getFlexBalance(timesheet.currentRelation.ID);
            } else {
                this.displayValue = '0';
            }
        });
    }

    private getFlexBalance(relationID) {
        this.timesheetService.getFlexBalance(relationID).subscribe(
            (res: any) => {
                if (res.WorkRelation && res.WorkRelation.EndTime) {
                    var et = moment(res.WorkRelation.EndTime);
                    if (et.year() > 1980) {
                        if (et.hour() > 12) { et = moment(et.add(1, 'days').format('YYYY-MM-DD')); }
                        if (et.year() > 1980 && et < moment(res.BalanceDate)) {
                            res.LastDayExpected = 0;
                            res.LastDayActual = 0;
                            res.relationIsClosed = true;
                        }
                    }
                }

                const minutes = res.Minutes - (res.LastDayActual - res.LastDayExpected);
                const hours  = (minutes / 60);
                this.displayValue = hours.toFixed(1) + ' timer';
                this.negative = hours < 0;
            }
        );
    }

    public onClickNavigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl('/timetracking/timeentry');
        }
    }
}
