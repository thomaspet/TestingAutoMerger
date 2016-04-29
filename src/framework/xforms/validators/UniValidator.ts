import {UniValidationOperators} from '../validators';

export class UniValidator {
    public EntityType: string;
    public PropertyName: string;
    public Operator: number;
    public Operation: number;
    public Level: number;
    public Value: any;
    public ErrorMessage: string;
    public ValidatorKey: string;
    public Validator: Function;

    constructor(obj: any) {
        this.EntityType = obj.EntityType;
        this.PropertyName = obj.PropertyName;
        this.Operation = obj.Operation;
        this.Operator = obj.Operator;
        this.Level = obj.Level;
        this.Value = obj.Value;
        this.ErrorMessage = obj.ErrorMessage;
        this.ValidatorKey = UniValidationOperators[this.Operator].name;
        this.Validator = UniValidationOperators[this.Operator].validator(this.Value, this.ValidatorKey);
    }
}
