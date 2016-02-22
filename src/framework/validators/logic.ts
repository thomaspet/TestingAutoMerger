import {Control} from "angular2/common";

export function greaterThan(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) > value) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function lowerThan(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) < value) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function greaterEqualThan(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) >= value) {
            return null;
        }
        return {
            key: true
        };
    };
}

export function lowerEqualThan(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) <= value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function equalTo(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) === value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function notEqualTo(value: number, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (parseInt(c.value, 10) !== value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}