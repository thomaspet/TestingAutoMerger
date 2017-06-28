import {FormControl} from '@angular/forms';

export function required(value = null, key: string) {
    'use strict';
    return function validator(c: FormControl): any {
        if (c.value === null || c.value === '' || c.value === undefined) {
            let error = {};
            error[key] = true;
            return error;
        }
        return null;

    };
}
