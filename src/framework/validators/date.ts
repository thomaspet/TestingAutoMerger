import {Control} from "angular2/common";

declare var _;

export function isDate(value: any, key: string) {
    "use strict";
    return function (c: Control): {[key:string]: boolean} {
        if (_.isDate(c.value)) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function isDateGreaterThan(value: any, key: string) {
    "use strict";
    return function (c: Control): {[key: string]: boolean} {
        if (_.isDate(c.value) && c.value.getTime() > value.getTime()) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function isDateGreaterThanEqual(value: any, key: string) {
    "use strict";
    return function (c: Control): {[key: string]: boolean} {
        if (_.isDate(c.value) && c.value.getTime() >= value.getTime()) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function isDateLowerThan(value: any, key: string) {
    "use strict";
    return function (c: Control): {[key: string]: boolean} {
        if (_.isDate(c.value) && c.value.getTime() < value.getTime()) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function isDateLowerThanEqual(value: any, key: string) {
    "use strict";
    return function (c: Control): {[key: string]: boolean} {
        if (_.isDate(c.value) && c.value.getTime() <= value.getTime()) {
            return null;
        }
        return {
            key: true
        };
    };
}
