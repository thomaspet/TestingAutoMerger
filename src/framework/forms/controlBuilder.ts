import {Control} from "angular2/common";

declare var _;

export class ControlBuilder {
    static build(fieldConfig, syncValidators,asyncValidators) {
        let control = new Control("", syncValidators, asyncValidators);
        control.updateValue(_.get(fieldConfig.model,fieldConfig.field),{
            onlySelf: false,
            emitEvent: false,
            emitModelToViewChange: true
        });
        return control;
    }
}
