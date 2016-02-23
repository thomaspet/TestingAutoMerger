import {IValidationItem} from "../validators";
declare var _;

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

    withValidator(validator: IValidationItem, value: any) {
        this.Value = value;
        this.ValidatorKey = validator.name;
        this.Validator = validator.validator(this.Value, this.ValidatorKey);
        return this;
    }
}
