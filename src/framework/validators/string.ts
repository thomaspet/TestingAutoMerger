import {Control} from "angular2/common";

export function contains(value:string, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (c.value.indexOf(value) > -1){
            return null;
        }
        return {
            key: message
        }
    };
}

export function maxLenght(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (c.value.length < value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function minLength(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (c.value.length > value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function match(value:RegExp|string, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        var re: RegExp;
        if (typeof value === "string") {
            re = new RegExp(value);
        }
        if (re.test(c.value)){
            return null;
        }
        return {
            key: message
        }
    };
}