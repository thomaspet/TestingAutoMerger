import {Component, Input, Output, EventEmitter} from '@angular/core';
import { LocalDate } from '@uni-entities';
import * as moment from 'moment';

export interface IDateSelectorEmitValue {
    fromDate: LocalDate;
    toDate: LocalDate;
}

@Component({
    selector: 'uni-date-selector',
    templateUrl: './dateselector.html',
    styleUrls: ['./dateselector.sass']
})
export class UniDateSelector {
    @Input()
    public toDate: any;

    @Input()
    public fromDate: any;

    @Output()
    public dateChange = new EventEmitter<IDateSelectorEmitValue>();

    weeks: any[] = [];
    _MONTHS = ['', 'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    _DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    months: any[] = [];
    fromMonths: any[] = [];

    currentFromMonth: number;
    currentToMonth: number;

    currentFromYear: number;
    currentToYear: number;

    currentFilter: any;

    periodFilters: any = [];

    constructor() { }

    ngOnInit() {
        this.weeks = this.getWeeks();
        this.periodFilters = this.generatePeriodFilters();
        this.setFromAndToDate(this.fromDate ? this.fromDate.Date : new Date(), this.toDate ? this.toDate.Date : new Date());
    }

    selectFilter(filter) {
        if (this.currentFilter) {
            this.currentFilter.selected = false;
        }

        filter.selected = true;
        this.currentFilter = filter;
        this.setFromAndToDate(this.currentFilter.from, this.currentFilter.to, true);
    }

    getWeeks() {
        const weeks = [''];

        for (let i = 1; i <= 52; i++) {
            weeks.push('Uke: ' + i);
        }

        return weeks;
    }

    public setFromAndToDate(from: any, to: any, isChange: boolean = false) {
        this.toDate = {
            Date: moment(to),
            DateFormatted: moment(to).format('DDMMYYYY')
        };

        this.fromDate = {
            Date: moment(from),
            DateFormatted: moment(from).format('DDMMYYYY')
        };

        this.setMonthAndYear();

        if (isChange) {
            this.dateChange.emit({ fromDate: this.fromDate, toDate: this.toDate });
        }
    }

    private setMonthAndYear() {
        this.currentFromMonth = moment(this.fromDate.Date).month();
        this.currentToMonth = moment(this.toDate.Date).month();
        this.currentFromYear = moment(this.fromDate.Date).year();
        this.currentToYear = moment(this.toDate.Date).year();

        this.months = this.getFormattedMonths(this.createYearArray(this.currentToYear));
        this.fromMonths = this.getFormattedMonths(this.createYearArray(this.currentFromYear));
    }

    public calenderDateSelected(isFrom: boolean = false, day) {
        // Remove selector marking on period filter when user selects custom dates
        if (this.currentFilter) {
            this.currentFilter.selected = false;
            this.currentFilter = null;
        }

        if (isFrom) {
            this.fromDate = day;
            if (moment(this.toDate.Date).isBefore(moment(day.Date))) {
                this.toDate = day;
            }
        } else {
            this.toDate = day;
            if (moment(this.fromDate.Date).isAfter(moment(day.Date))) {
                this.fromDate = day;
            }
        }
        this.setMonthAndYear();
    }

    public monthChange(isFrom: boolean, direction: number) {
        if (isFrom) {
            if (this.currentFromMonth === 0 && direction === -1) {
                this.currentFromYear--;
                this.fromMonths = this.getFormattedMonths(this.createYearArray(this.currentFromYear));
                this.currentFromMonth = 11;
            } else if (this.currentFromMonth === 11 && direction === 1) {
                this.currentFromYear++;
                this.fromMonths = this.getFormattedMonths(this.createYearArray(this.currentFromYear));
                this.currentFromMonth = 0;
            } else {
                this.currentFromMonth += direction;
            }
        } else {
            if (this.currentToMonth === 0 && direction === -1) {
                this.currentToYear--;
                this.months = this.getFormattedMonths(this.createYearArray(this.currentToYear));
                this.currentToMonth = 11;
            } else if (this.currentToMonth === 11 && direction === 1) {
                this.currentToYear++;
                this.months = this.getFormattedMonths(this.createYearArray(this.currentToYear));
                this.currentToMonth = 0;
            } else {
                this.currentToMonth += direction;
            }
        }
    }

    public onMonthSelected(month: any) {
        if (this.currentFilter) {
            this.currentFilter.selected = false;
            this.currentFilter = null;
        }
        if (month) {
            const index = this._MONTHS.findIndex(m => m === month) - 1;
            this.setFromAndToDate(moment(moment().month(index).startOf('month')), moment(moment().month(index).endOf('month')), true);
        }
    }

    public onWeekSelected(week: any) {
        if (this.currentFilter) {
            this.currentFilter.selected = false;
            this.currentFilter = null;
        }
        if (week) {
            const index = this.weeks.findIndex(w => w === week);
            this.setFromAndToDate(moment(moment().week(index).startOf('week')), moment(moment().week(index).endOf('week')), true);
        }
    }

    // Generate year
    private createYearArray(year) {
        let counterDate = moment(year + '-01-01');
        const endDate = moment(year + '-12-31');

        const array = [];
        while (moment(counterDate).isSameOrBefore(moment(endDate))) {
            array.push({
                Date: counterDate,
                WeekDay: moment(counterDate).isoWeekday(),
                calenderText: moment(counterDate).format('DD'),
                DateFormatted: moment(counterDate).format('DDMMYYYY')
            });
            counterDate = moment(counterDate).add(1, 'days');
        }
        return array;

    }

    public getFormattedMonths(timeSheet) {
        const base = [];
        let index = 0;
        for (let i = 0; i < timeSheet.length; i++) {
            const m = new Date(timeSheet[i].Date).getMonth();
            if (base.length === m) {
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
            if (timeSheet[i].WeekDay === 7 && new Date(timeSheet[i].Date).getMonth() === m) {
                base[m].push([]);
                index++;
            }
        }
        return base;
    }

    public getPeriodeText() {
        if (!this.fromDate || !this.toDate) {
            return '';
        }
        return moment(this.fromDate.Date).format('DD.MMM YYYY') + ' - ' + moment(this.toDate.Date).format('DD.MMM YYYY');
    }

    private generatePeriodFilters() {
        return [
            [
                {
                    label: 'Denne uken',
                    value: 'THIS_WEEK',
                    from: moment().startOf('week').format('YYYY.MM.DD'),
                    to: moment().endOf('week').format('YYYY.MM.DD')
                },
                {
                    label: 'Denne måned',
                    value: 'THIS_MONTH',
                    from: moment().startOf('month').format('YYYY.MM.DD'),
                    to: moment().endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Dette kvartal',
                    value: 'THIS_QUARTER',
                    from: moment().startOf('quarter').format('YYYY.MM.DD'),
                    to: moment().endOf('quarter').format('YYYY.MM.DD')
                },
                {
                    label: 'Dette år',
                    value: 'THIS_YEAR',
                    from: moment().startOf('year').format('YYYY.MM.DD'),
                    to: moment().endOf('year').format('YYYY.MM.DD')
                }
            ],
            [
                {
                    label: 'Forrige uke',
                    value: 'LAST_WEEK',
                    from: moment().weekday(-7).format('YYYY.MM.DD'),
                    to: moment().weekday(-7).endOf('week').format('YYYY.MM.DD')
                },
                {
                    label: 'Forrige måned',
                    value: 'LAST_MONTH',
                    from: moment().subtract(1, 'months').startOf('month').format('YYYY.MM.DD'),
                    to: moment().subtract(1, 'months').endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Forrige kvartal',
                    value: 'LAST_QUARTER',
                    from: moment().subtract(1, 'quarter').startOf('quarter').format('YYYY.MM.DD'),
                    to: moment().subtract(1, 'quarter').endOf('quarter').format('YYYY.MM.DD')
                },
                {
                    label: 'Forrige år',
                    value: 'LAST_YEAR',
                    from: moment().subtract(1, 'year').startOf('year').format('YYYY.MM.DD'),
                    to: moment().subtract(1, 'year').endOf('year').format('YYYY.MM.DD')
                }
            ],
            [
                {
                    label: '1. termin',
                    value: 'TERMIN1',
                    from: moment().month(0).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(1).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '2. termin',
                    value: 'TERMIN2',
                    from: moment().month(2).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(3).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '3. termin',
                    value: 'TERMIN3',
                    from: moment().month(4).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(5).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '4. termin',
                    value: 'TERMIN4',
                    from: moment().month(6).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(7).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '5. termin',
                    value: 'TERMIN5',
                    from: moment().month(8).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(9).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '6. termin',
                    value: 'TERMIN6',
                    from: moment().month(10).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(11).endOf('month').format('YYYY.MM.DD')
                }
            ],
            [
                {
                    label: '1. kvartal',
                    value: 'QUARTER1',
                    from: moment().month(0).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(2).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '2. kvartal',
                    value: 'QUARTER2',
                    from: moment().month(3).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(5).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '3. kvartal',
                    value: 'QUARTER3',
                    from: moment().month(6).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(8).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: '4. kvartal',
                    value: 'QUARTER4',
                    from: moment().month(9).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(11).endOf('month').format('YYYY.MM.DD')
                },
            ]
        ];
    }
}
