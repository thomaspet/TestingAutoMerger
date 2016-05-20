import {required} from "./input";
import {contains, match, maxLenght, minLength, eqLenght} from "./string";
import {equalTo, notEqualTo, greaterEqualThan, greaterThan, lowerEqualThan, lowerThan} from "./logic";
import {isDate, isDateGreaterThan, isDateGreaterThanEqual, isDateLowerThan, isDateLowerThanEqual} from "./date";

export * from './UniValidator';

export interface IValidationItem {
    name: string;
    validator: Function;
}

export var UniValidationOperators: IValidationItem[] = [
    {
        name: "lowerThan",
        validator: lowerThan
    },
    {
        name: "greaterThan",
        validator: greaterThan
    },
    {
        name: "lowerEqualThan",
        validator: lowerEqualThan
    },
    {
        name: "greaterEqualThan",
        validator: greaterEqualThan
    },
    {
        name: "minLength",
        validator: minLength
    },
    {
        name: "maxLenght",
        validator: maxLenght
    },
    {
        name: "eqLenght",
        validator: eqLenght
    },
    {
        name: "required",
        validator: required
    },
    {
        name: "equalTo",
        validator: equalTo
    },
    {
        name: "notEqualTo",
        validator: notEqualTo
    },
    {
        name: "match",
        validator: match
    }
    //match,
    //matchField,
    //contains,
    //isDate,
    //isDateGreaterThan,
    //isDateGreaterThanEqual,
    //isDateLowerThan,
    //isDateLowerThanEqual
];
