import {ValidationLevel} from '../unientities';

export class ValidationResult {
    public Messages: Array<ValidationMessage>;
}

export class ValidationMessage {
    public EntityID: number;
    public EntityType: string;
    public ID: number;
    public Level: ValidationLevel;
    public Message: string;
    public PropertyName: string;
}