import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
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
export class UniDateSelector implements OnChanges {
    @Input()
    public toDate: any;

    @Input()
    public fromDate: any;

    @Output()
    public dateChange = new EventEmitter<IDateSelectorEmitValue>();

    _MONTHS = ['', 'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    _DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    _DATE_FORMAT_STRING = 'YYYY.MM.DD';
    months: any[] = [];
    fromMonths: any[] = [];

    currentFromMonth: number;
    currentToMonth: number;

    currentFromYear: number;
    currentToYear: number;

    periodFilters: any = [];
    initialDataLoaded: boolean = false;

    constructor() { }

    ngOnInit() {
        this.periodFilters = this.generatePeriodFilters();
        this.setFromAndToDate(this.fromDate?.Date ?? this.fromDate ?? new Date(), this.toDate?.Date ?? this.toDate ?? new Date());
        this.initialDataLoaded = true;
    }

    public ngOnChanges() {
        if (this.initialDataLoaded) {
            this.setFromAndToDate(this.fromDate?.Date ?? this.fromDate ?? new Date(), this.toDate?.Date ?? this.toDate ?? new Date());
        }
    }

    selectFilter(filter) {
        this.periodFilters.forEach(array => {
            array.forEach(f => {
                f.selected = false;
            });
        });

        filter.selected = true;
        this.setFromAndToDate(filter.from, filter.to, true);
    }

    public setFromAndToDate(from: any, to: any, isChange: boolean = false) {

        this.toDate = {
            Date: moment(to, this._DATE_FORMAT_STRING),
            DateFormatted: moment(to, this._DATE_FORMAT_STRING).format('YYYY.MM.DD')
        };

        this.fromDate = {
            Date: moment(from, this._DATE_FORMAT_STRING),
            DateFormatted: moment(from, this._DATE_FORMAT_STRING).format('YYYY.MM.DD')
        };

        this.setMonthAndYear();

        // Lets see if we can highlight a periodfilter because of match
        this.periodFilters.forEach(array => {
            array.forEach(filter => {
                if (filter.from === this.fromDate.DateFormatted && filter.to === this.toDate.DateFormatted) {
                    filter.selected = true;
                }
            });
        });

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
        this.periodFilters.forEach(array => {
            array.forEach(filter => {
                filter.selected = false;
            });
        });

        if (isFrom) {
            if (moment(this.toDate.Date).isBefore(moment(day.Date))) {
                this.toDate = day;
            }
            this.setFromAndToDate(day.Date, this.toDate.Date, true);
        } else {
            if (moment(this.fromDate.Date).isAfter(moment(day.Date))) {
                this.fromDate = day;
            }
            this.setFromAndToDate(this.fromDate.Date, day.Date, true);
        }
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
                DateFormatted: moment(counterDate).format('YYYY.MM.DD')
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
                    label: 'Jan',
                    value: 'MONTH1',
                    from: moment().month(0).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(0).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Feb',
                    value: 'MONTH1',
                    from: moment().month(1).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(1).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Mar',
                    value: 'MONTH1',
                    from: moment().month(2).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(2).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Apr',
                    value: 'MONTH1',
                    from: moment().month(3).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(3).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Mai',
                    value: 'MONTH1',
                    from: moment().month(4).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(4).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Juni',
                    value: 'MONTH1',
                    from: moment().month(5).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(5).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Juli',
                    value: 'MONTH1',
                    from: moment().month(6).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(6).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Aug',
                    value: 'MONTH1',
                    from: moment().month(7).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(7).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Sep',
                    value: 'MONTH1',
                    from: moment().month(8).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(8).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Okt',
                    value: 'MONTH1',
                    from: moment().month(9).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(9).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Nov',
                    value: 'MONTH1',
                    from: moment().month(10).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(10).endOf('month').format('YYYY.MM.DD')
                },
                {
                    label: 'Des',
                    value: 'MONTH1',
                    from: moment().month(11).startOf('month').format('YYYY.MM.DD'),
                    to: moment().month(11).endOf('month').format('YYYY.MM.DD')
                }
            ]
        ];
    }
}
