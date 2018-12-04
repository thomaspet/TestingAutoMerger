import * as moment from 'moment';
export function autocompleteDate(
        inputValue: string,
        denyYearInFuture: boolean = false,
        useLastMonthsPreviousYearUntilMonth?: number): Date {

    'use strict';
    let day, month, year;
    const date = new Date();

    const split = inputValue.split(/\/|\.|-|,/);

    let yearWasSpecified: boolean = false;

    if (split.length > 1) {
        day = split[0];
        month = +split[1] - 1;
        year = split[2] || date.getFullYear();
        if (year.length === 2) {
            year = date.getFullYear().toString().substr(0, 2) + year;
        }
    } else {
        const input = inputValue.replace(/[^0-9]/g, '');
        switch (input.length) {
            case 1:
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
                if (input.indexOf('20') >= 2) {
                    // input format: DMYYYY
                    day = parseInt(input[0], 10);
                    month = parseInt(input[1], 10) - 1;
                    year = parseInt(input.slice(2), 10);
                    yearWasSpecified = true;
                } else {
                    // input format: DDMMYY
                    day = parseInt(input.slice(0, 2), 10);
                    month = parseInt(input.slice(2, 4), 10) - 1;
                    year = parseInt(date.getFullYear().toString().substr(0, 2) + input.slice(4), 10);
                    yearWasSpecified = true;
                }
                break;
            case 8:
                day = parseInt(input.slice(0, 2), 10);
                month = parseInt(input.slice(2, 4), 10) - 1;
                year = parseInt(input.slice(4), 10);
                yearWasSpecified = true;
                break;
            default:
                return null;
        }
    }

    // When a new year has started the user will in some contexts most likely
    // want to use the previous year when setting a short-date at the end of the
    // year, e.g. 1512 will normally mean 15.12.2018 when the current date is 25.01.2019.
    // Using the setting useLastMonthsPreviousYearUntilMonth the component can be used to
    // specify how many months this behavior will be active.
    if (!yearWasSpecified) {
        if (useLastMonthsPreviousYearUntilMonth && useLastMonthsPreviousYearUntilMonth > date.getMonth()) {
            const minMonthNoToSetInPreviousYear = 12 - useLastMonthsPreviousYearUntilMonth + date.getMonth();

            if (month > minMonthNoToSetInPreviousYear && year === date.getFullYear()) {
                year = year - 1;
            }
        }
    }

    if (denyYearInFuture === true) {
        if (year > date.getFullYear()) {
            year -= 100;
        }
    }

    if (year < 1900) {
        return null;
    }

    if (month < 0 || month > 11) {
        return null;
    }

    const autocompleted = new Date(year, month);
    if (day > moment(autocompleted).daysInMonth()) {
        return null;
    }

    autocompleted.setDate(day);
    return autocompleted;
}
