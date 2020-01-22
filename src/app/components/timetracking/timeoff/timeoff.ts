import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormControl} from '@angular/forms';
import {IToolbarConfig} from '../../common/toolbar/toolbar';

import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {PageStateService, WorkerService} from '@app/services/services';
import {UniTimeEditModal} from './timeEditModal';
import {UniModalService} from '@uni-framework/uni-modal';
import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';

@Component({
    selector: 'uni-work-time-off',
    templateUrl: './timeoff.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniWorkTimeOff {

    _DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    _MONTHS = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    views = [
        { label: 'År', value: 'year' },
        { label: 'Måned', value: 'month' },
        { label: 'Liste', value: 'list' }
    ];
    currentView: any;
    currentDay: any;
    currentYear: number = new Date().getFullYear();
    currentMonth: number = new Date().getMonth();
    thisYear: number =  new Date().getFullYear();
    nextYear: number = this.currentYear + 1;
    timeoff: any[] = [];
    timeSheet: any[] = [];
    filteredTimeSheet: any[] = [];
    filterString: string = '';
    months: any[] = [];
    showOnlyTimeOff: boolean = false;
    scrollbar: PerfectScrollbar;
    searchControl: FormControl = new FormControl('');
    toolbarconfig: IToolbarConfig = {
        title: 'Administrer felles fridager'
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private workerService: WorkerService,
        private modalService: UniModalService
    ) {
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredTimeSheet = this.getFilteredTimeSheet();
                setTimeout(() => {
                    if (this.scrollbar) {
                        this.scrollbar.update();
                    }
                });
            });

        this.route.queryParams.subscribe(params => {

            const view = params['view'];
            this.showOnlyTimeOff = params['onlyTimeOff'] === 'true';

            let index = this.views.findIndex(v => v.value === view);
            index = index > 0 ? index : 0;
            this.currentView = this.views[index];

            this.getData();
            this.addTab();
        });
    }

    public getData() {
        this.createYearArray();
        this.workerService.getWorkTimeOff(this.currentYear).subscribe(result => {
            this.timeSheet = this.createYearArray();
            this.timeoff = result ? result.Data : [];
            this.months = this.getFormattedMonths();
            this.filteredTimeSheet = this.getFilteredTimeSheet();

            const date = this.currentDay ? this.currentDay.Date : new Date();

            const index = this.filteredTimeSheet.findIndex((day) => moment(day.Date).isSame(moment(date), 'day'));

            if (index !== -1) {
                this.currentDay = this.filteredTimeSheet[index];
            } else {
                this.currentDay = this.filteredTimeSheet[0];
            }
            this.currentMonth = new Date(this.currentDay.Date).getMonth();

            if (this.currentView.value === 'list') {
                setTimeout(() => {
                    const list = document.getElementById('role-info');
                    const listElement = document.getElementsByClassName('selected')[0];
                    list.scrollTop = listElement['offsetTop'];
                });
            }

            // Init perfect scrollbar
            if (this.currentView.value === 'list') {
                this.scrollbar = new PerfectScrollbar('#role-info');
            }

            this.cdr.markForCheck();
        });
    }

    // Generate year
    private createYearArray() {
        let counterDate = moment(this.currentYear + '-01-01');
        const endDate = moment(this.currentYear + '-12-31');

        const array = [];
        while (moment(counterDate).isSameOrBefore(moment(endDate))) {
            array.push({
                Date: counterDate,
                WeekDay: moment(counterDate).isoWeekday(),
                dayText: this._DAYS[moment(counterDate).isoWeekday() - 1],
                dateText: moment(counterDate).format('DD.MMM'),
                calenderText: moment(counterDate).format('DD')
            });
            counterDate = moment(counterDate).add(1, 'days');
        }
        return array;

    }

    public getFormattedMonths() {
        const base = [];
        const timeoffClone = [].concat(this.timeoff);
        let index = 0;
        for (let i = 0; i < this.timeSheet.length; i++) {
            const m = new Date(this.timeSheet[i].Date).getMonth();
            if (base.length === m) {
                base.push([[]]);
                index = 0;
                if (this.timeSheet[i].WeekDay !== 1) {
                    for (let a = 1; a < this.timeSheet[i].WeekDay; a++) {
                        base[m][0].push({});
                    }
                }
            }
            for (let j = 0; j < timeoffClone.length; j++) {
                if (moment(this.timeSheet[i].Date).isSameOrBefore(timeoffClone[j].ToDate, 'day') &&
                    moment(this.timeSheet[i].Date).isSameOrAfter(timeoffClone[j].FromDate, 'day')) {
                    this.timeSheet[i].TimeOff = timeoffClone[j];
                }
            }

            base[m][index].push(this.timeSheet[i]);
            // New week in same month
            if (this.timeSheet[i].WeekDay === 7 && new Date(this.timeSheet[i].Date).getMonth() === m) {
                base[m].push([]);
                index++;
            }
        }
        return base;
    }

    public getFilteredTimeSheet() {
        const index = this._DAYS.findIndex(day => day.toLowerCase().includes(this.filterString.toLowerCase())) + 1;
        return this.timeSheet.filter((day) => {
            const match = day.WeekDay === index
            || moment(day.Date) === moment(this.filterString)
            || moment(day.Date).format('DD-MM-YYYY').toString().includes(this.filterString)
            || moment(day.Date).format('MMMM').toString().toLowerCase().includes(this.filterString.toLowerCase());


            return match && (this.showOnlyTimeOff && !!day.TimeOff || !this.showOnlyTimeOff);
        });
    }

    public onDaySelect(day: any) {
        this.currentDay = day;
        this.currentMonth = new Date(this.currentDay.Date).getMonth();
        // Open modal if year-view
        if (this.currentView.value === 'year') {
            this.modalService.open(UniTimeEditModal, { data: { currentDay: day } }).onClose.subscribe(res => {
                this.getData();
            });
        }
    }

    public goToMonthView(month: any) {
        const firstWeek = month[0];
        const day = firstWeek.find(week => week.calenderText === '01');

        if (day) {
            this.currentDay = day;
            this.currentMonth = new Date(this.currentDay.Date).getMonth();
            this.currentView = this.views[1];
            this.addTab();
        }
    }

    public yearSelect(year: number) {
        if (year === this.currentYear) {
            return;
        }
        this.currentYear = year;
        this.getData();
    }

    public monthChange(direction: number = 1) {
        if (this.currentMonth === 0 && direction === -1) {
            if (this.currentYear === this.nextYear) {
                this.currentMonth = 11;
                this.currentYear = this.thisYear;
                return;
            }
            return;
        }
        if (this.currentMonth === 11 && this.currentYear === this.thisYear) {
            this.currentMonth = 0;
            this.currentYear = this.nextYear;
            return;
        }
        this.currentMonth += direction;
    }

    public getIcon(day: any) {
        if (day && day.TimeOff) {
            return 'beach_access';
        }
        return '';
    }

    public isToday(day: any) {
        return moment(day.Date).isSame(moment(new Date()), 'day');
    }

    public getHeaderText() {
        if (!this.currentDay) {
            return '';
        }

        return this._DAYS[this.currentDay.WeekDay - 1] + ' - ' +  moment(this.currentDay.Date).format('DD.MMMM  YYYY');
    }

    public addTab() {
        this.pageStateService.setPageState('view', this.currentView.value);
        this.pageStateService.setPageState('onlyTimeOff', this.showOnlyTimeOff + '');


        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.TimeOff,
            active: true,
            name: 'Administrer fridager'
        });
    }

    public changeListView() {
        this.showOnlyTimeOff = !this.showOnlyTimeOff;
        this.filteredTimeSheet = this.getFilteredTimeSheet();
        this.addTab();

        setTimeout(() => {
            const list = document.getElementById('role-info');
            const listElement = document.getElementsByClassName('selected')[0];
            if (list && listElement) {
                list.scrollTop = listElement['offsetTop'];
            }
            this.scrollbar.update();
        });
    }

    public viewChange(view) {
        this.currentView = view;
        this.addTab();
        if (view.value === 'list') {
            setTimeout(() => {
                const list = document.getElementById('role-info');
                const listElement = document.getElementsByClassName('selected')[0];
                list.scrollTop = listElement['offsetTop'];
            });
            setTimeout(() => {
                this.scrollbar = new PerfectScrollbar('#role-info');
            }, 100);
        }
    }


}
