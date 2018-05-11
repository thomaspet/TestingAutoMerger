import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IUniWidget} from '../uniWidget';
import {Router} from '@angular/router';
import {AuthService} from '../../../authService';
import {WorkerService, TimesheetService} from '../../../services/services';
import * as moment from 'moment';

@Component({
    selector: 'uni-flex',
    template: `
        <div class="positive-negative-widget"
             (click)="onClickNavigate()"
             title="Totalsum flexiid">

            <span>Timesaldo</span>
            <span class="value" [ngClass]="{'bad': needsAttention}">
                {{displayValue || '-'}}
            </span>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniFlexWidget {
    public widget: IUniWidget;

    private displayValue: string;
    public needsAttention: boolean;

    constructor(
        private router: Router,
        private authService: AuthService,
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {

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
                this.needsAttention = hours < 0;
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
