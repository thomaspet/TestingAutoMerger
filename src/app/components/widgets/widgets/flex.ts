import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {Router} from '@angular/router';
import {TimesheetService} from '../../../services/services';
import {WidgetDataService} from '../widgetDataService';
import * as moment from 'moment';

@Component({
    selector: 'uni-flex',
    template: `
        <div class="sum_widget yellow-counter" (click)="onClickNavigate()" title="Gå til timeføring">
            <div class="numbers-section">
                <div class="header">Timesaldo</div>
                <div>{{ displayValue || '-' }}</div>
            </div>

            <i class="material-icons-outlined"> watch_later </i>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniFlexWidget {
    widget: IUniWidget;
    displayValue: string;
    color = '#9bc9a9';

    constructor(
        private router: Router,
        private timesheetService: TimesheetService,
        private cdr: ChangeDetectorRef,
        private widgetDataService: WidgetDataService
    ) {}

    public ngAfterViewInit() {
        if (this.widgetDataService.hasAccess('ui_timetracking_timeentry')) {
            this.timesheetService.initUser().subscribe(
                (timesheet) => {
                    if (timesheet && timesheet.currentRelation) {
                        this.getFlexBalance(timesheet.currentRelation.ID);
                    } else {
                        this.displayValue = '0';
                        this.cdr.markForCheck();
                    }
                },
                err => {/* fail silently */}
            );
        }
    }

    private getFlexBalance(relationID) {
        this.timesheetService.getFlexBalance(relationID).subscribe(
            (res: any) => {
                if (res.WorkRelation && res.WorkRelation.EndTime) {
                    let et = moment(res.WorkRelation.EndTime);
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
                this.displayValue = hours.toFixed(1);
                this.color = hours >= 0 ? '#9bc9a9' : '#f4a899';
                this.cdr.markForCheck();
            },
            err => {}
        );
    }

    public onClickNavigate() {
        if (!this.widget._editMode) {
            this.router.navigateByUrl('/timetracking/timeentry');
        }
    }
}
