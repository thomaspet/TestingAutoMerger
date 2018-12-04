
import {Injectable} from '@angular/core';

@Injectable()
export class DateUtil {
    public autocompleteDate(inputValue: string, currentYear?: number, useLastMonthsPreviousYearUntilMonth?: number): Date {
        let day, month, year;

        const date = new Date();

        const split = inputValue.split(/\/|\.|-|,/);

        let yearWasSpecified = false;

        if (split.length > 1) {
            day = split[0];
            month = +split[1] - 1;
            year = split[2] || currentYear || date.getFullYear();

            if (split[2] && split[2].length === 2) {
                year = parseInt(date.getFullYear().toString().substr(0, 2) + split[2], 10);
                yearWasSpecified = true;
            } else if (split[2] && split[2].length === 4) {
                year = parseInt(split[2], 10);
                yearWasSpecified = true;
            } else {
                year = currentYear || date.getFullYear();
            }
        } else {
            const input = inputValue.replace(/[^0-9]/g, '');
            switch (input.length) {
                case 1:
                    day = parseInt(input, 10);
                    month = date.getMonth();
                    year = currentYear ? currentYear : date.getFullYear();
                    break;
                case 2:
                    day = parseInt(input, 10);
                    month = date.getMonth();
                    year = date.getFullYear();
                    year = currentYear ? currentYear : date.getFullYear();
                    break;
                case 3:
                    day = parseInt(input.slice(0, 2), 10);
                    month = parseInt(input[2], 10) - 1; // - 1 because js month is zero based
                    year = date.getFullYear();
                    year = currentYear ? currentYear : date.getFullYear();
                    if (day > new Date(year, month, 0).getDate()) {
                        day = parseInt(input[0], 10);
                        month = parseInt(input.slice(1), 10) - 1;
                    }
                    break;
                case 4:
                    day = parseInt(input.slice(0, 2), 10);
                    month = parseInt(input.slice(2), 10) - 1;
                    year = date.getFullYear();
                    year = currentYear ? currentYear : date.getFullYear();
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
    }
}
