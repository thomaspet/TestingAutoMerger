import {Component, ViewChild, Input} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../../services/timetracking/timesheetService';
import {WorkerService, ItemInterval, IFilter} from '../../../../services/timetracking/workerService';
import {toIso} from '../../../common/utils/utils';
import {ErrorService} from '../../../../services/services';
import {UniTimeModal} from '../../components/popupeditor';
import {IPreSaveConfig} from '../timeentry';
import * as moment from 'moment';

@Component({
    selector: 'timetracking-timetable',
    templateUrl: './timetable.html'
})
export class TimeTableReport {
    @ViewChild(UniTimeModal) private timeModal: UniTimeModal;
    @Input() public eventcfg: IPreSaveConfig;
    private timesheet: TimeSheet;
    public config: {
        title: string,
        items: Array<any>,
        sumWork: number,
        sumTotal: number
    };
    public report: IReport;
    public filters: Array<IFilter>;
    public currentFilter: IFilter;
    public busy: boolean = true;

    constructor(
        private workerService: WorkerService,
        private timesheetService: TimesheetService,
        private errorService: ErrorService
    ) {
        this.filters = [
            { name: 'month', label: 'Denne måned', interval: ItemInterval.thisMonth},
            { name: 'months', label: 'Siste 2 måneder', interval: ItemInterval.lastTwoMonths},
            { name: 'months2', label: 'Siste 3 måneder', interval: ItemInterval.lastThreeMonths},
            { name: 'year', label: 'Dette år', interval: ItemInterval.thisYear}
        ];

    }

    public activate(ts: TimeSheet, filter?: IFilter) {
        if (!this.timesheet) {
            this.currentFilter = this.filters[0];
        }
        this.timesheet = ts;
        this.onFilterClick( this.currentFilter );
    }

    public onDayClick(day: Date, checkSave: boolean = true) {
        if (day) {

            if (this.eventcfg && checkSave) {
                this.eventcfg.askSave().then( () => {
                    this.onDayClick(day, false);
                    this.eventcfg.askReload();
                });
                return;
            }

            this.timeModal.open(this.timesheet.currentRelation, day).then( x => {
                if (x) {
                    this.onFilterClick( this.currentFilter );
                    if (this.eventcfg && this.eventcfg.askReload) { this.eventcfg.askReload(); }
                }
            });
        }
    }

    private onFilterClick(filter: IFilter) {
        var f: IFilter;
        this.filters.forEach( value => {
            if (value.name === filter.name) {
                f = value;
                f.isSelected = true;
            } else {
                value.isSelected = false;
            }
        });
        this.currentFilter = f;
        this.queryTimesheetReport();
    }

    private queryTimesheetReport() {
        this.busy = true;
        var dt = toIso(moment(this.workerService.getIntervalDate(this.currentFilter.interval))
            .startOf('week').toDate());
        this.workerService.get(`workrelations/${this.timesheet.currentRelation.ID}?action=timesheet&fromdate=${dt}`)
            .subscribe( result => {
                this.report = this.groupIntoWeeks(<IReport>result);
                this.busy = false;
            }, err => this.errorService.handle(err));    
    }

    private groupIntoWeeks(report: IReport): any {
        var weeks = [];
        var week: IWeek;

        // Move items into each week (for easier templating)
        for (var i = 0; i < report.Items.length; i++) {
            let item = report.Items[i];
            if ((week && item.WeekNumber !== week.WeekNumber) || (!week)) {
                week = { WeekNumber: item.WeekNumber, FirstDay: item.Date, Items: [], Sums: new Sums() };
                week.Items.push(item);
                weeks.push(week);
            } else {
                week.Items.push(item);
            }
        }

        // Add empty days at the end of last row?
        if (week && week.Items.length < 7) {
            let start = week.Items.length;             
            for (let ii = start; ii < 7; ii++) { 
                let endDate = moment(week.FirstDay).add(ii, 'days').toDate();
                week.Items.push( { TotalTime: 0, IsWeekend: ii >= 5, Date: endDate } );
            }            
        }

        // Creatsums
        this.sumWeeks(weeks);
        report.Weeks = weeks;

        return this.groupIntoMonths(report);
    }

    private groupIntoMonths(report: IReport): IReport {
        var months: Array<Month> = [];
        var month: Month;
        for (var i = 0; i < report.Weeks.length; i++) {
            let week = report.Weeks[i];
            if (month === undefined || (!month.isInMonth(week))) {
                month = new Month(week.Items[week.Items.length - 1].Date);
                month.Weeks.push(week);
                months.push(month);
            } else {
                month.Weeks.push(week);
            }
            this.addSums(month.Sums, week.Sums);
        }
        report.Months = months;
        return report;
    }

    private sumWeeks(weeks: Array<IWeek>) {
        weeks.forEach( x => x.Items.forEach( y => this.addSums(x.Sums, y)) );
    }

    private addSums(sum: Sums, day: IWorkDay | Sums) {
        sum.ExpectedTime += day.ExpectedTime || 0;
        sum.Flextime += day.Flextime || 0;
        sum.Overtime += day.Overtime || 0;
        sum.Projecttime += day.Projecttime || 0;
        sum.SickTime += day.SickTime || 0;
        sum.TimeOff += day.TimeOff || 0;
        sum.ValidTime += day.ValidTime || 0;
        sum.Invoicable += day.Invoicable || 0;
        sum.ProjectPrc = this.minValue(100, (sum.Projecttime || 0) / (sum.ExpectedTime || 1) * 100);
        sum.InvoicePrc = this.minValue(100, (sum.Invoicable || 0) / (sum.ExpectedTime || 1) * 100);    
        // sum.Status = ?? todo: combine statuses from all days
    }

    private minValue(v1: number, v2: number): number {
        return v1 < v2 ? v1 : v2;
    }

}

// tslint:disable:variable-name

class Month {
    public Date: Date;
    public Name: string;
    public Weeks: Array<IWeek> = [];
    public Sums: Sums = new Sums();
    constructor(date: Date) {
        this.Date = date;
        this.Name = moment(date).format('MMMM').toLocaleUpperCase();
    }
    public isInMonth(week: IWeek): boolean {
        var md = moment(week.Items[4].Date).toDate().getMonth();        
        return (md === moment(this.Date).toDate().getMonth());
    }
}

interface IWeek {
    WeekNumber: number;
    FirstDay: Date;
    Items: Array<IWorkDay>;
    Sums?: Sums;
    // Accumulative?: Sums;
}

class Sums {
    public Name: string;
    public TotalTime: number = 0;
    public ValidTime: number = 0;
    public ExpectedTime: number = 0;
    public TimeOff: number = 0;
    public SickTime: number = 0;
    public Overtime: number = 0;
    public Flextime: number = 0;
    public Invoicable: number = 0;
    public Projecttime: number = 0;
    public Status: number = 0;        
    public ProjectPrc?: number;
    public InvoicePrc?: number;    
}

interface IWorkDay {
    Date: Date;
    TotalTime: number;
    IsWeekend: boolean;
    ExpectedTime?: number;
    ValidTime?: number;
    TimeOff?: number;
    SickTime?: number;
    Overtime?: number;
    Flextime?: number;
    Invoicable?: number;
    Projecttime?: number;
    Status?: number;
}

interface IReport {
    Relation;
    FromDate: Date;
    ToDate: Date;
    Items: Array<any>;
    Workflow;
    Weeks?: Array<IWeek>;
    Months?: Array<Month>;
}
