import {IValidationItem} from "../validators";

import {UniValidationOperators} from "../validators";

export class UniValidator {
    EntityType: string;
    PropertyName: string;
    Operator: number;
    Operation: number;
    Level: number;
    Value: any;
    ErrorMessage: string;
    ValidatorKey: string;
    Validator: Function;

    constructor() {
    }

    static fromObject(obj: any) {
        var x = new UniValidator();
        x.EntityType = obj.EntityType;
        x.PropertyName = obj.PropertyName;
        x.Operation = obj.Operation;
        x.Operator = obj.Operator;
        x.Level = obj.Level;
        x.Value = obj.Value;
        x.ErrorMessage = obj.ErrorMessage;
        console.log(UniValidationOperators);
        x.ValidatorKey = UniValidationOperators[x.Operator].name;
        x.Validator = UniValidationOperators[x.Operator].validator(x.Value, x.ValidatorKey);

        return x;
    };

    withOperation(op: number) {
        this.Operation = op;
        return this;
    }

    withOperator(op: number) {
        this.Operator = op;
        return this;
    }

    usingValue(value:any) {
        this.Value = value;
        return this;
    }

    build() {
        this.ValidatorKey = UniValidationOperators[this.Operator].name;
        this.Validator = UniValidationOperators[this.Operator].validator(this.Value, this.ValidatorKey);
        return this;
    }
}
