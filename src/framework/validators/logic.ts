import {Control} from "angular2/common";

export function greaterThan(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (parseInt(c.value,10) > value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function lowerThan(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (parseInt(c.value,10) < value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function greaterEqualThan(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (parseInt(c.value,10) >= value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function lowerEqualThan(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (parseInt(c.value,10) <= value){
            return null;
        }
        return {
            key: message
        }
    };
}

export function equalThan(value:number, key:string, message: string) {
    return function validator(c: Control): {[key:string]: boolean} {
        if (parseInt(c.value,10) == value){
            return null;
        }
        return {
            key: message
        }
    };
}