import {Component, ViewChild, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {TimesheetService} from '../../../services/timetracking/timesheetService';
import {ToastService} from '../../../../framework/uniToast/toastService';
import {ErrorService} from '../../../services/services';
import {WorkBalance, WorkRelation} from '../../../unientities';
import {UniTimeModal} from './popupeditor';
import {roundTo} from '../../common/utils/utils';
import * as moment from 'moment';

@Component({
    selector: 'approve-details',
    templateUrl: './approvedetails.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveDetails {
    @ViewChild(UniTimeModal) private timeModal: UniTimeModal;
    @Input() public set workrelation(value: WorkRelation ) {
        this.busy = true;
        this.current = value;
        this.reloadBalance(value);
    }

    public busy: boolean = true;
    private current: WorkRelation;
    public currentBalance: WorkBalanceDto;
    private groupedWeeks: IDetails = { weeks: [], sum: 0 };

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private timesheetService: TimesheetService,
        private errorService: ErrorService,
        private toast: ToastService) {

    }

    public onDayClick(item: IDetail, checkSave: boolean = true) {
        this.timeModal.open(this.current, item.Date).then( x => {
            if (x) {
                this.reloadBalance(this.current);
            }
        });
    }    

    private reloadBalance(rel: WorkRelation, details: boolean = true) {
        var workRelationId = rel ? rel.ID : 0;
        if (!workRelationId) {
            // this.valueChange.emit(0);
            this.currentBalance = new WorkBalanceDto();
            this.busy = false;
        } else {
            this.timesheetService.getFlexBalance(workRelationId, details).subscribe( (x: any) => {
                this.busy = false;
                let prevBalance = this.currentBalance;
                this.currentBalance = x;

                if (details) {
                    this.groupedWeeks = this.groupIntoWeeks(x.Details);
                    this.currentBalance.hours = prevBalance.hours;
                    this.currentBalance.Minutes = prevBalance.Minutes;
                    this.currentBalance.Previous = prevBalance.Previous;
                } else {

                    // Workrelation ended ?
                    if (x.WorkRelation && x.WorkRelation.EndTime) {
                        var et = moment(x.WorkRelation.EndTime);
                        if (et.year() > 1980) {
                            if (et.hour() > 12) { et = moment(et.add(1, 'days').format('YYYY-MM-DD')); }
                            if (et.year() > 1980 && et < moment(x.BalanceDate)) {
                                x.LastDayExpected = 0;
                                x.LastDayActual = 0;
                                x.relationIsClosed = true;
                            }
                        }
                    }

                    x.PreExpected = x.ExpectedMinutes - x.LastDayExpected;
                    var preActual = x.ActualMinutes - x.LastDayActual;
                    var preMinutes = x.Minutes - (x.LastDayActual - x.LastDayExpected);

                    this.currentBalance.lastDayBalance = x.LastDayActual - x.LastDayExpected;
                    this.currentBalance.lastDayBalanceHours = roundTo((x.LastDayActual - x.LastDayExpected) / 60, 1);

                    this.currentBalance.hours = roundTo( preMinutes / 60, 1 );
                    this.currentBalance.expectedHours = roundTo( x.ExpectedMinutes / 60, 1);
                    this.currentBalance.actualHours = roundTo( preActual / 60, 1);
                    this.currentBalance.offHours = roundTo( x.ValidTimeOff / 60, 1);

                    // this.valueChange.emit(this.currentBalance.hours);
                }
                this.refresh();

            }, (err) => {
                console.log('Unable to fetch balance');
                this.busy = false;
            });
        }
    }

    private groupIntoWeeks(details: IDetail[]): IDetails {
        var weeks: Week[] = [];
        var curWeek: Week;
        var tsum = 0;
        for (var i = details.length - 1; i >= 0; i--) {
            let x = details[i];
            var wk = this.WeekFromDate(x.Date);
            if (!curWeek) {
                curWeek = wk;
            }
            if (wk.key !== curWeek.key) {
                weeks.push(curWeek);
                curWeek = wk;
            }
            curWeek.addItem(x);
            tsum += x.Sum;
        }
        if (!!curWeek) {
            weeks.push(curWeek);
        }

        return { weeks: weeks, sum: tsum };
    }



    private WeekFromDate(dt: Date): Week {
        var md = moment(dt);
        var wk = new Week();
        wk.year = md.year();
        wk.week = md.isoWeek();
        wk.key = wk.year + '-' + wk.week;
        return wk;
    }    

    private refresh() {
        this.changeDetectorRef.markForCheck();
    }    


}




interface IDetails {
    weeks: Array<Week>;
    sum: number;
}

interface IDetail {
    Date?: Date;
    ExpectedMinutes: number;
    WorkedMinutes: number;
    ValidTimeOff: number;
    IsWeekend: boolean;
    IsToday: boolean;
    Sum: number;
}

class Week {
    public key: string;
    public year: number;
    public week: number;
    public items: IDetail[];
    public sum: number = 0;
    private todayChecked: boolean = false;

    constructor() {
    }

    private initDays(date: Date) {

        if (!this.items) {
            this.items = [ this.newDetail(0), this.newDetail(1), this.newDetail(2),
                this.newDetail(3), this.newDetail(4), this.newDetail(5), this.newDetail(6)];
        }

        if (!this.todayChecked) {
            var tempDay = moment(date);
            var today = moment();
            if (tempDay.year() === today.year() && tempDay.isoWeek() === today.isoWeek()) {
                let ix = today.isoWeekday() - 1;
                this.items[ix].IsToday = true;
            }
            this.todayChecked = true;
        }

    }

    public addItem(item: IDetail) {
        this.initDays(item.Date);
        var dt = moment(item.Date);
        var ixDay = dt.isoWeekday() - 1;
        if (ixDay >= 0) {
            item.IsToday = dt.isSame(moment(), 'day');
            this.items[ixDay] = item;
            item.Sum = item.WorkedMinutes - item.ExpectedMinutes;
            this.sum += item.Sum;
        }
    }

    private newDetail(dayNumber: number): IDetail {
        return {
            ExpectedMinutes: 0, WorkedMinutes: 0, ValidTimeOff: 0,
            IsWeekend: dayNumber >= 5, IsToday: false, Sum: 0
        };
    }
}

// tslint:disable:variable-name
class WorkBalanceDto extends WorkBalance {
    public LastDayExpected: number;    
    public LastDayActual: number;
    public expectedHours: number;
    public actualHours: number;
    public offHours: number;
    public hours: number;
    public lastDayBalanceHours: number;
    public lastDayBalance: number;
    public relationIsClosed: boolean;
    public Previous: any;
    public PreExpected: number;
}
