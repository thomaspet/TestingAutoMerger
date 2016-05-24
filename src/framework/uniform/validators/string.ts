import {Control} from '@angular/common';

export function contains(value: string, key: string) {
    'use strict';
    return function validator(c: Control): any {
        if (c.value.indexOf(value) > -1) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function eqLenght(value: number, key: string) {
    'use strict';
    return function validator(c: Control): any {
        if (c.value.length === value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function maxLenght(value: number, key: string) {
    'use strict';
    return function validator(c: Control): any {
        if (c.value.length < value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function minLength(value: number, key: string) {
    'use strict';
    return function validator(c: Control): any {
        if (c.value.length > value) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}

export function match(value: RegExp|string, key: string) {
    'use strict';
    return function validator(c: Control): any {
        var re: RegExp;
        if (typeof value === 'string') {
            re = new RegExp(value);
        }
        if (re.test(c.value)) {
            return null;
        }
        let error = {};
        error[key] = true;
        return error;
    };
}
