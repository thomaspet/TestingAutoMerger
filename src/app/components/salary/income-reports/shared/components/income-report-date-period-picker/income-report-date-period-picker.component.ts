import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, QueryList, ViewChildren } from '@angular/core';
import { DateRange, MatDateRangePicker } from '@angular/material/datepicker';
import { LocalDate } from '@uni-entities';
import * as moment from 'moment';
import { IPeriode } from '../../shared-services/incomeReportHelperService';

interface IPeriod {
    fom: Date;
    tom: Date;
    _invisible?: boolean;
}

interface IPeriodValidations {
    [index: number] : string[]
}

interface IValidation {
    message: string;
}

export interface IValidationDays {
    maxDaysBetweenPeriods: number;
    maxDaysWithSingleDayPeriod: number;
    maxDaysPeriods: number;
}

@Component({
  selector: 'uni-income-report-date-period-picker',
  templateUrl: './income-report-date-period-picker.component.html',
  styleUrls: ['./income-report-date-period-picker.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeReportDatePeriodPickerComponent implements OnChanges {

    @Input() periods: IPeriode[];
    @Input() label: string;
    @Input() validationDays: IValidationDays;
    @Input() readOnly: boolean;
    @Output() periodsChange: EventEmitter<IPeriode[]> = new EventEmitter();
    @ViewChildren(MatDateRangePicker) rangePickers: QueryList<MatDateRangePicker<DateRange<Date>>>;
    _periods: IPeriod[];
    currentInput: 'fom' | 'tom';

    get maxDaysBetweenPeriods() {
        return this.validationDays?.maxDaysBetweenPeriods ?? 0;
    }

    validations: IValidation[] = [];
    validationMessage: string;

    constructor() { }

    ngOnChanges(): void {
        if (this.periods) {
            this._periods = this.sortPeriods(this.periods
                    .map(period => ({
                        fom: new Date(period.fom?.toString()),
                        tom: new Date(period.tom?.toString())
                    }))
                );
            this.validateAllPeriods(this._periods);
        }
    }

    onChange(index: number, field: 'fom' | 'tom') {
        this.handleChange(index, field);
        setTimeout(() => {
            if (field === this.currentInput) {
                this.emitChange(this._periods)
            }
        });
    }

    onMenuClose(index: number) {
        const period = this._periods[index];
        if (period.fom && period.tom) {
            period._invisible = false;
            this.handleChange(index, 'fom', true);
            this.handleChange(index, 'tom', true);
            this.emitChange(this._periods);
        } else {
            this._periods = [...this._periods.slice(0, this._periods.length - 1)];
        }
    }

    addDate() {
        if (this.readOnly) {
            return;
        }
        this._periods = [
            ...this._periods,
            <IPeriod>{
                fom: null,
                tom: null,
                _invisible: true,
            }
        ]
        setTimeout(() => this.rangePickers.last.open());
    }

    removeDate(index: number) {
        if (this.readOnly) {
            return;
        }
        this._periods = [
            ...this._periods.slice(0, index),
            ...this._periods.slice(index + 1, this._periods.length),
        ]
        this.emitChange(this._periods);
        this.validateChange(this._periods);
    }

    private handleChange(index: number, field: 'fom' | 'tom', ignoreAutoFillin?: boolean) {
        const period = this._periods[index];
        if (period.fom > period.tom) {
            const fields = ['fom', 'tom'];
            period[fields.find(f => f !== field)] = period[field];
        }
        if (this._periods.length === 1 && field === 'fom' && this.validationDays?.maxDaysPeriods && !ignoreAutoFillin) {
            period.tom = moment(period.fom).add(this.validationDays.maxDaysPeriods - 1, 'days').toDate();
        }
        this.validateChange(this._periods);
    }

    private validateAllPeriods(periods: IPeriod[]) {
        this.validations = [
            ...this.validateAnyDateOverlap(periods),
            ...this.validateDateDiff(periods),
            ...this.validatePeriodDays(periods)
        ];
        this.validationMessage = this.validations.map(validation => validation.message).join(', ');
    }

    private validatePeriodDays(periods: IPeriod[]) {
        let validation = [];
        if (!this.validationDays || !periods.length) {
            return validation;
        }

        const totalDays = periods
            .map(period => moment(period.tom).diff(moment(period.fom), 'days') + 1)
            .map(diff => Math.max(diff, 0))
            .reduce((acc, curr) => acc + curr, 0);

        const expectedDays = periods.some(period => !moment(period.fom).diff(moment(period.tom), 'days'))
            ? this.validationDays.maxDaysWithSingleDayPeriod
            : this.validationDays.maxDaysPeriods;

        if (totalDays !== expectedDays) {
            validation = [
                ...validation,
                this.createValidation(
                    `Registrert arbeidsgiverperiode er nå på ${totalDays} ${totalDays === 1 ? 'dag' : 'dager'}. `
                    + `Må være totalt ${this.validationDays.maxDaysPeriods} dager `
                    + `eller ${this.validationDays.maxDaysWithSingleDayPeriod} med enkeltstående dager`
                ),
            ]
        }

        return validation;
    }

    private validateAnyDateOverlap(periods: IPeriod[]) {
        let validations = [];
        this._periods
            .forEach(
                period =>  validations = [...validations, ...this.validateOverlap(periods, period, validations)]
            );
        return validations;
    }

    private validateOverlap(periods: IPeriod[], basePeriod: IPeriod, existingValidations: IValidation[]): IValidation[] {
        let validation: IValidation[] = [];
        periods.forEach(period => {
            if (period === basePeriod
                || (existingValidations.some(validation => validation.message.includes(this.toString(period))
                    && validation.message.includes(this.toString(basePeriod))))) {
                return;
            }
            if (this.hasOverlap(period, basePeriod)) {
                validation = [
                    ...validation,
                    this.createValidation(
                        `periodene ${this.toString(period)} og ${this.toString(basePeriod)} overlapper`,
                    ),
                ];
            }
        })

        return validation;
    }

    private validateDateDiff(periods: IPeriod[]) {
        let validation = [];
        if (periods.length < 2 && this.validationDays) {
            return validation;
        }
        this.sortPeriods([...periods])
            .reduce((acc: [IPeriod[]], curr: IPeriod) => acc[0].length > 1
                ? [...acc, [acc[acc.length - 1][1], curr]]
                : [[...acc[0], curr]]
                , [[]]
            )
            .forEach(pair => {
                if(this.hasTooHighDateDiff(pair[0], pair[1])) {
                    validation = [
                        ...validation,
                        this.createValidation(
                            `periodene ${this.toString(pair[0])} og ${this.toString(pair[1])} har for mange dager mellom seg. `
                            + `Det skal maks være ${this.maxDaysBetweenPeriods} dager mellom perioder`,
                        ),
                    ];
                }
            });
        return validation;
    }

    private sortPeriods(periods: IPeriod[]) {
        return periods.sort((period1, period2) => period1.fom.valueOf() - period2.fom.valueOf());
    }

    private createValidation(message: string) {
        return {
            message: message,
        }
    }

    private toString(period: IPeriod) {
        return `${this.getDateString(period.fom)} - ${this.getDateString(period.tom)}`;
    }

    private getDateString(date: Date) {
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    }

    private toDate(date: Date) {
        if (!date) {
            return null;
        }
        return new LocalDate(date?.toString());
    }

    private hasTooHighDateDiff(basePeriod: IPeriod, period: IPeriod): boolean {
        if (!this.maxDaysBetweenPeriods) {
            return false;
        }
        return moment(period.fom).diff(basePeriod.tom, 'days') > (this.maxDaysBetweenPeriods + 1);
    }

    private hasOverlap(period: IPeriod, basePeriod: IPeriod): boolean {
        return basePeriod.fom <= period.tom && basePeriod.tom >= period.fom;
    }

    private validateChange(periods: IPeriod[]) {
        this.validateAllPeriods(periods);
    }

    private emitChange(periods: IPeriod[]) {
        if (!this.hasChanges()) {
            return;
        }
        this.periodsChange
            .next(periods
                .map(period => ({
                        fom: this.toDate(period.fom),
                        tom: this.toDate(period.tom)
                    })
                )
            );
    }

    private hasChanges(): boolean {
        if (this._periods.length !== this.periods.length) {
            return true;
        }
        return this._periods
            .map((internalPeriod: IPeriod, i) => !this.periodsEquals(internalPeriod, this.periods[i]))
            .reduce((acc, curr) => acc && curr, true);
    }

    private periodsEquals(internal: IPeriod, external: IPeriode): boolean {
        const fields = ['fom', 'tom']
        return fields.map(field => {
            const internalDate = <Date>internal[field];
            const externalDate = <LocalDate>external[field];
            return internalDate.getFullYear() === externalDate.year
                && internalDate.getMonth() === externalDate.month
                && internalDate.getDate() === externalDate.day;
        })
        .reduce((acc, curr) => acc && curr, true);
    }

}
