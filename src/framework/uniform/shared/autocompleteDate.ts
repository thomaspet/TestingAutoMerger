import moment from 'moment';
export function autocompleteDate(inputValue: string): Date {
    'use strict';
    let day, month, year;
    let date = new Date();

    const split = inputValue.split(/\/|\.|-|,/);

    if (split.length > 1) {
        day = split[0];
        month = +split[1] - 1;
        year = split[2] || date.getFullYear();
        if (year.length === 2) {
            year = date.getFullYear().toString().substr(0, 2) + year;
        }
    } else {
        let input = inputValue.replace(/[^0-9]/g, '');
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
                    year = parseInt(input.slice(2));
                } else {
                    // input format: DDMMYY
                    day = parseInt(input.slice(0, 2), 10);
                    month = parseInt(input.slice(2, 4), 10) - 1;
                    year = parseInt(date.getFullYear().toString().substr(0, 2) + input.slice(4), 10);
                }
                break;
            case 8:
                day = parseInt(input.slice(0, 2), 10);
                month = parseInt(input.slice(2, 4), 10) - 1;
                year = parseInt(input.slice(4), 10);
                break;
            default:
                return null;
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
