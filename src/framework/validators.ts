import {matchField, required} from "./validators/input";
import {contains, match, maxLenght, minLength} from "./validators/string";
import {equalThan, greaterEqualThan, greaterThan, lowerEqualThan, lowerThan} from "./validators/logic";
import {isDate, isDateGreaterThan, isDateGreaterThanEqual, isDateLowerThan, isDateLowerThanEqual} from "./validators/date";

export var UniValidators: Function[] = [
    matchField, required,
    contains, match, maxLenght, minLength,
    equalThan, greaterEqualThan, greaterThan, lowerEqualThan, lowerThan,
    isDate, isDateGreaterThan, isDateGreaterThanEqual, isDateLowerThan, isDateLowerThanEqual
];
