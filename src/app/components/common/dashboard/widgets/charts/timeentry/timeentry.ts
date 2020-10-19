import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import {WorkRelation, TimeSheetItem} from '@uni-entities';
import {AuthService} from '@app/authService';
import {UniModalService} from '@uni-framework/uni-modal';
import {TimesheetService} from '@app/services/services';
import {DashboardDataService} from '../../../dashboard-data.service';
import {UniTimeModal} from '@app/components/common/timetrackingCommon';

import * as moment from 'moment';

interface CalendarEntry {
    date: Date;
    classList: string[];
    weekNumber: number;
}

@Component({
    selector: 'timeentry-widget',
    templateUrl: './timeentry.html',
    styleUrls: ['./timeentry.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeentryWidget {
    calendarDate = moment();
    calendarMonthName: string;

    calendar: CalendarEntry[][];
    dayLabels = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

    workRelation: WorkRelation;
    loading = true;
    activating = false;
    missingWorker = false;

    flexBalance: number;
    flexBalanceChangeInPeriod: number;

    constructor(
        private cdr: ChangeDetectorRef,
        private authService: AuthService,
        private timesheetService: TimesheetService,
        private dataService: DashboardDataService,
        private modalService: UniModalService,
    ) {}

    ngOnInit() {
        this.getWorkRelationAndInit();
    }

    private getWorkRelationAndInit() {
        this.getWorkRelation().subscribe(workRelation => {
            this.missingWorker = !workRelation;

            if (workRelation) {
                this.workRelation = workRelation;
                this.initCalendar();
                this.loadFlexBalance();
            }

            this.loading = false;
            this.cdr.markForCheck();
        });
    }

    private initCalendar(ignoreCache?: boolean) {
        this.calendarMonthName = this.calendarDate.format('MMMM');

        const calendar = [];

        const startDay = this.calendarDate.clone().startOf('month').startOf('week');
        const endDay = this.calendarDate.clone().endOf('month').endOf('week');

        const date = startDay.clone().subtract(1, 'day');

        while (date.isBefore(endDay, 'day')) {
            const week: CalendarEntry[] = Array(7).fill(0).map(() => {
                const weekDay = date.add(1, 'day').clone();
                const classList = [];
                if (weekDay.isSame(moment(), 'day')) {
                    classList.push('today');
                }

                if (!weekDay.isSame(this.calendarDate, 'month')) {
                    classList.push('different-month');
                }

                return {
                    date: weekDay.toDate(),
                    classList: classList,
                    weekNumber: weekDay.week()
                };
            });

            calendar.push(week);
        }

        this.calendar = calendar;
        this.cdr.markForCheck();

        this.loadCalendarData(startDay, endDay, ignoreCache);
    }

    private loadCalendarData(startDay, endDay, ignoreCache: boolean) {
        const endpoint = `/api/biz/workrelations/${this.workRelation.ID}?action=timesheet`
            + `&fromdate=${startDay.format('YYYY-MM-DD')}`
            + `&todate=${endDay.format('YYYY-MM-DD')}`;

        this.dataService.get(endpoint, ignoreCache).subscribe(
            res => {
                const items: TimeSheetItem[] = res && res.Items || [];
                let flexBalanceChangeInPeriod = 0;

                this.calendar.forEach(week => {
                    week.forEach(calendarDay => {
                        if (moment(calendarDay.date).isSameOrBefore(moment())) {
                            const timesheetItem = items.find(item => moment(calendarDay.date).isSame(moment(item.Date), 'day'));

                            // Ignore today from calculations if the user haven't registered hours today yet
                            const isToday = moment(calendarDay.date).isSame(moment(), 'day');
                            if (!isToday || timesheetItem.TotalTime > 0) {
                                // Calc flex balance changes for selected month
                                if (moment(calendarDay.date).isSame(moment(this.calendarDate), 'month')) {
                                    flexBalanceChangeInPeriod += timesheetItem.Flextime;
                                }

                                // Add css class for indicating the calendar day's flex balance
                                if (timesheetItem.Flextime < 0) {
                                    calendarDay.classList.push(timesheetItem.TotalTime ? 'warn' : 'bad');
                                } else if (timesheetItem.Flextime === 0) {
                                    // For weekend days we only want the good indicator if flex is > 0
                                    calendarDay.classList.push(timesheetItem.IsWeekend ? '' : 'good');
                                } else {
                                    calendarDay.classList.push('good');
                                }
                            }
                        }
                    });
                });

                this.flexBalanceChangeInPeriod = parseFloat(flexBalanceChangeInPeriod.toFixed(1));
                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    private loadFlexBalance(ignoreCache?: boolean) {
        const endpoint = `/api/biz/workrelations/${this.workRelation.ID}?action=calc-flex-balance&hateoas=false`;
        this.dataService.get(endpoint, ignoreCache).subscribe(
            res => {
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

                // Show flex balance from yesterday if user has not registered hours today
                const minutes = res.LastDayActual > 0
                    ? res.Minutes
                    : res.Minutes - (res.LastDayActual - res.LastDayExpected);

                this.flexBalance = parseFloat((minutes / 60).toFixed(1));
                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    private getWorkRelation() {
        const userID = this.authService.currentUser.ID;
        return this.dataService.get(
            `/api/biz/workrelations?expand=worker&filter=worker.userid eq ${userID}&hateoas=false`
        ).pipe(
            map(res => res && res[0]),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }

    openTimeEntryDialog(day: CalendarEntry) {
        this.modalService.open(UniTimeModal, {
            data: {
                relation: this.workRelation,
                date: moment(day.date).format('YYYY-MM-DD'),
            }
        }).onClose.subscribe(timesheetChange => {
            if (timesheetChange) {
                this.initCalendar(true);
                this.loadFlexBalance(true);
            }
        });
    }

    activateWorker() {
        if (!this.activating) {
            this.activating = true;
            this.cdr.markForCheck();
            this.timesheetService.initUser(undefined, true).subscribe(() => {
                this.getWorkRelationAndInit();
                this.activating = false;
            });
        }
    }

    nextMonth() {
        if (!this.calendarDate.isSame(moment(), 'month')) {
            this.calendarDate.add(1, 'month');
            this.initCalendar();
        }
    }

    prevMonth() {
        this.calendarDate.subtract(1, 'month');
        this.initCalendar();
    }
}
