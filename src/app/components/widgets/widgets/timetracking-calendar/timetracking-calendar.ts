import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IUniWidget} from '../../uniWidget';
import {WidgetDataService} from '../../widgetDataService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {UserService, TimesheetService} from '@app/services/services';
import {UniModalService} from '@uni-framework/uni-modal';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {UniTimeModal} from '@app/components/common/timetrackingCommon';
import * as moment from 'moment';

@Component({
    selector: 'timetracking-calendar-widget',
    template: `
        <div class="timebox-container" title="{{ widget.description }}" [attr.aria-busy]="busy">
            <div class="timetracking-calendar-header">Timeføring</div>

            <a *ngIf="missingWorker" class="missing-worker" (click)="activateWorker()">
                Aktiver timeføring
            </a>

            <div *ngIf="!missingWorker" class="timebox-calendar-container">
                <div class="calender-select-month-header">
                    <i class="material-icons" (click)="monthChange(-1)"> chevron_left </i>
                    <span>
                        {{ _MONTHS[currentMonth + 1] }} {{ currentYear }}
                    </span>
                    <i class="material-icons" (click)="monthChange(1)"> chevron_right </i>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th *ngFor="let day of _DAYS">{{ day.substr(0,2) }}</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr *ngFor="let week of monthsOneYear[monthIndex]">
                            <td *ngFor="let weekday of week"
                                title="{{ weekday.titleText }}"
                                [class.selected]="weekday.DateFormatted === today.DateFormatted"
                                (click)="openTimeReg(weekday)">
                                {{ weekday.calenderText }}
                                <div *ngIf="weekday.calenderText" [ngClass]="weekday.flexClass"> </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div *ngIf="!missingWorker" class="timebox-footer">
                <a (click)="openTimeReg(today)">
                    Registrer timer
                </a>
            </div>
        </div>
    `,
    styleUrls: ['./timetracking-calendar.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TimetrackingCalendar {
    widget: IUniWidget;
    missingWorker: boolean;
    busy: boolean;

    _MONTHS = ['', 'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    _DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    monthsOneYear: any[] = [];
    currentMonth: number = new Date().getMonth();
    currentYear: number = new Date().getFullYear();
    today: any = {
        Date: moment(),
        WeekDay: moment().isoWeekday(),
        titleText: moment().format('DD. MMM YYYY') + ' (Idag)',
        calenderText: moment().format('DD'),
        DateFormatted: moment().format('YYYY-MM-DD'),
    };
    selectedDay: any = {};
    timeTrackingTemplates: any[] = [];
    monthIndex: number = 3;
    startDate: any = moment().subtract(3, 'month').startOf('month');
    endDate = moment().endOf('month');
    relation: any;

    constructor(
        private cdr: ChangeDetectorRef,
        private userService: UserService,
        private dataService: WidgetDataService,
        private modalService: UniModalService,
        private browserStorage: BrowserStorageService,
        private toastService: ToastService,
        private timesheetService: TimesheetService,
    ) {
        this.timeTrackingTemplates = this.browserStorage.getItem('timeTrackingTemplates') || [];
        this.getDataAndLoadCalendar();
    }

    public getDataAndLoadCalendar() {
        this.userService.getCurrentUser().subscribe((user) => {
            const route = `/api/biz/workrelations?expand=worker,workprofile&filter=worker.userid eq ${user.ID}&hateoas=false`;
            this.dataService.clearCache();
            this.dataService.request(route).subscribe((workRelation) => {
                if (workRelation && workRelation.length) {
                    this.missingWorker = false;
                    this.relation = workRelation[0];
                    this.dataService.request(
                        `api/biz/workrelations/${workRelation[0].ID}?action=timesheet&`
                        + `fromdate=${moment().subtract(3, 'month').format('YYYY-MM-DD')}&todate=${moment().format('YYYY-MM-DD')}`
                    ).subscribe((flex) => {
                        this.monthsOneYear = this.getFormattedMonths(this.createMonths(flex));
                        this.cdr.markForCheck();
                    });
                } else {
                    this.missingWorker = true;
                    this.cdr.markForCheck();
                }
            });
        });
    }

    activateWorker() {
        if (!this.busy) {
            this.busy = true;
            this.cdr.markForCheck();
            this.timesheetService.initUser(undefined, true).subscribe(() => {
                this.getDataAndLoadCalendar();
                this.busy = false;
            });
        }
    }

    public monthChange(direction: number) {
        if ((this.monthIndex === 0 && direction === -1) || (this.monthIndex === this.monthsOneYear.length - 1 && direction === 1)) {
            this.toastService.addToast('4 måneders visning', ToastType.warn, ToastTime.medium,
            'Denne widgeten støtter kun visning av siste 4 mnd. For komplett oversikt, ' +
            `<a href="/#/timetracking/timeentry?mode=Registrering">gå til timeføringsbildet</a>`);
        } else {
            this.monthIndex += direction;
            this.currentMonth += direction;
        }
    }

    private createMonths(flex: any) {
        let counterDate = moment(this.startDate);
        const ftime: any[] = [...flex.Items];

        const array = [];
        while (moment(counterDate).isSameOrBefore(moment(this.endDate))) {
            let flexClass = '';
            if (ftime.length && moment(ftime[0].Date).format('DDMMYYYY') === moment(counterDate).format('DDMMYYYY')) {
                flexClass = '';
                const item = ftime[0];
                if (item.WeekDay > 5) {
                    flexClass = '';
                } else if (item.Flextime < 0) {
                    const percentWorked = (item.ExpectedTime + item.Flextime) / (item.ExpectedTime || 1) * 100;
                    flexClass = percentWorked >= 50 ? 'calendar_flexminus_light' : 'calendar_flexminus';
                } else {
                    flexClass = 'calendar_flexplus';
                }
                ftime.shift();
            }

            array.push({
                Date: counterDate,
                WeekDay: moment(counterDate).isoWeekday(),
                calenderText: moment(counterDate).format('DD'),
                titleText: moment(counterDate).format('DD. MMM YYYY'),
                DateFormatted: moment(counterDate).format('YYYY-MM-DD'),
                flexClass: flexClass
            });
            counterDate = moment(counterDate).add(1, 'days');
        }
        return array;
    }

    public openTimeReg(day: any) {

        this.selectedDay = day;
        this.modalService.open(UniTimeModal, { data:
            {
                relation: this.relation,
                date: this.selectedDay.DateFormatted,
                templates: this.timeTrackingTemplates
            }
        }).onClose.subscribe(res => {
            if (res) {
                this.getDataAndLoadCalendar();
            }
        });
    }

    public getFormattedMonths(timeSheet) {
        const base = [];
        let index = 0;

        let m = -1;

        for (let i = 0; i < timeSheet.length; i++) {
            const day = new Date(timeSheet[i].Date).getDate();
            if (day === 1) {
                m++;
                base.push([[]]);
                index = 0;
                if (timeSheet[i].WeekDay !== 1) {
                    for (let a = 1; a < timeSheet[i].WeekDay; a++) {
                        base[m][0].push({});
                    }
                }
            }

            base[m][index].push(timeSheet[i]);
            // New week in same month
            if (timeSheet[i].WeekDay === 7
                && moment(timeSheet[i].Date).format('DDMMYYYY') !== moment(timeSheet[i].Date).endOf('month').format('DDMMYYYY')) {
                base[m].push([]);
                index++;
            }
        }
        return base;
    }
}
