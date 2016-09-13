export function autocompleteDate(inputValue: string): Date {
    'use strict';

    var input = inputValue.replace(/[^0-9]/g, '');

    var day, month, year;
    var date = new Date();

    switch (input.length) {
        case 0:
            return date;
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
            month = parseInt(input[2], 10) - 1;
            year = date.getFullYear();
            if (day > new Date(0, month, year).getDate()) {
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
            day = parseInt(input.slice(0, 2), 10);
            month = parseInt(input.slice(2, 4), 10) - 1;
            year = parseInt(date.getFullYear().toString().substr(0, 2) + input.slice(4), 10);
            break;
        case 8:
            day = parseInt(input.slice(0, 2), 10);
            month = parseInt(input.slice(2, 4), 10) - 1;
            year = parseInt(input.slice(4), 10);
            break;
        default:
            return null;
    }

    if (year < 1900) {
        return null;
    }
    if (month < 0 || month > 12) {
        return null;
    }

    // Check if day > max day of month
    // Need to +1 month here to get last day of current month
    // (js dates ftw)
    if (day > new Date(year, (month + 1), 0).getDate()) {
        return null;
    }

    return new Date(year, month, day);
}
