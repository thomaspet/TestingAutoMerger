import {Control} from "@angular/common";
import {Validators} from "@angular/common";

export function required(value = null, key: string) {
    "use strict";
    return function validator(c: Control): any {
        if (c.value === null || c.value === '' || c.value === undefined) {
            let error = {};
            error[key] = true;
            return error;
        }
        return null;

    };
}
