import {Injectable} from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import * as moment from 'moment';

@Injectable()
export class UniDateAdapter extends NativeDateAdapter {
    dateAdapter: NativeDateAdapter;

    getFirstDayOfWeek(): number {
        return 1;
    }

    getDayOfWeekNames(): string[] {
        return ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        if (style === 'long') {
            return [
                'januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli',
                'august', 'september', 'oktober', 'november', 'desember'
            ];
        } else if (style === 'short') {
            return ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
        } else if (style === 'narrow') {
            return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        }

    }

    format(date: Date, parseFormat: any): string {
        const dateAsMoment = moment(date);
        if (dateAsMoment.isValid()) {

            if (parseFormat && !parseFormat.day && parseFormat.month === 'short') {
                return dateAsMoment.format('MMM YYYY');
            }

            return dateAsMoment.format('DD.MM.YYYY');
        }

        return '';
    }

    parse(value: any): Date {
        let date = value;

        if (value === '*') {
            return new Date();
        }

        if (typeof date === 'string') {
            date = autocompleteDate(date);
        }

        const dateAsMoment = moment(date);
        if (dateAsMoment.isValid()) {
            return dateAsMoment.toDate();
        }

        return;
    }
}

export const autocompleteDate = (
    inputValue: string,
    yearOverride?: number,
    useSmartYear?: boolean,
) => {
    if (!inputValue) {
        return null;
    }

    let day, month, year;
    const date = new Date();
    if (yearOverride) {
        date.setFullYear(yearOverride);

        // Disable previous year parsing logic if we're already overriding the year
        if (yearOverride !== new Date().getFullYear()) {
            useSmartYear = false;
        }
    }

    const split = inputValue.split(/\/|\.|-|,/);

    let yearSpecified = false;
    if (split.length > 1) {
        day = split[0];
        month = +split[1] - 1;

        if (split[2] && split[2].length === 2) {
            yearSpecified = true;
            year = parseInt(date.getFullYear().toString().substr(0, 2) + split[2], 10);
        } else if (split[2] && split[2].length === 4) {
            yearSpecified = true;
            year = parseInt(split[2], 10);
        } else {
            year = date.getFullYear();
        }
    } else {
        const input = inputValue.replace(/[^0-9]/g, '');
        switch (input.length) {
            case 1:
                day = parseInt(input, 10);
                month = date.getMonth();
                year = date.getFullYear();
                break;
            case 2:
                day = parseInt(input, 10);
                month = date.getMonth();
                year = date.getFullYear();
                break;
            case 3:
                day = parseInt(input.slice(0, 2), 10);
                month = parseInt(input[2], 10) - 1; // - 1 because js month is zero based
                year = date.getFullYear();
                if (day > new Date(year, month, 0).getDate()) {
                    day = parseInt(input[0], 10);
                    month = parseInt(input.slice(1), 10) - 1;
                }
                break;
            case 4:
                day = parseInt(input.slice(0, 2), 10);
                month = parseInt(input.slice(2), 10) - 1;
                year = date.getFullYear();
                break;
            case 6:
                yearSpecified = true;
                if (input.indexOf('20') >= 2) {
                    // input format: DMYYYY
                    day = parseInt(input[0], 10);
                    month = parseInt(input[1], 10) - 1;
                    year = parseInt(input.slice(2), 10);
                } else {
                    // input format: DDMMYY
                    day = parseInt(input.slice(0, 2), 10);
                    month = parseInt(input.slice(2, 4), 10) - 1;
                    year = parseInt(date.getFullYear().toString().substr(0, 2) + input.slice(4), 10);
                }
                break;
            case 8:
                yearSpecified = true;
                day = parseInt(input.slice(0, 2), 10);
                month = parseInt(input.slice(2, 4), 10) - 1;
                year = parseInt(input.slice(4), 10);
                break;
            default:
                return null;
        }
    }

    // When a new year has started the user will in some contexts most likely
    // want to use the previous year when setting a short-date at the end of the
    // year, e.g. 1512 will normally mean 15.12.2018 when the current date is 25.01.2019.
    const currentMonth = new Date().getMonth();
    if (!yearSpecified && useSmartYear && currentMonth < 4) {
        if (month > (12 - 4 + currentMonth)) {
            year = year - 1;
        }
    }

    if (year < 1900) {
        return null;
    }

    if (month < 0 || month > 12) {
        return null;
    }

    if (day > new Date(year, (month + 1), 0).getDate()) {
        return null;
    }
    return new Date(year, month, day);
};
