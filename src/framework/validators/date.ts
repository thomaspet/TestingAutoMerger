import {Control} from "@angular/common";

declare var _;

export function isDate(value: any, key: string) {
    "use strict";
    return function (c: Control): any {
        if (_.isDate(c.value)) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function isDateGreaterThan(value: any, key: string) {
    "use strict";
    return function (c: Control): any {
        if (_.isDate(c.value) && c.value.getTime() > value.getTime()) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function isDateGreaterThanEqual(value: any, key: string) {
    "use strict";
    return function (c: Control): any {
        if (_.isDate(c.value) && c.value.getTime() >= value.getTime()) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function isDateLowerThan(value: any, key: string) {
    "use strict";
    return function (c: Control): any {
        if (_.isDate(c.value) && c.value.getTime() < value.getTime()) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function isDateLowerThanEqual(value: any, key: string) {
    "use strict";
    return function (c: Control): any {
        if (_.isDate(c.value) && c.value.getTime() <= value.getTime()) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}
