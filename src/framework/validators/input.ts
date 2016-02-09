import {Control} from "angular2/common";
import {Validators} from "angular2/common";

export function required(key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (c.value === null || c.value === '' || c.value === undefined) {
            return {
                key: message
            }
        }
        return null;

    };
}

export function matchField(controlToMatch:Control, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (controlToMatch.value === c.value){
            return null;
        }
        return {
            key: message
        }
    };
}
