import {Control} from "angular2/common";
import {UniInputBuilder} from "./uniInputBuilder";

declare var _;

export class ControlBuilder {
    static build(fieldConfig: UniInputBuilder, syncValidators: Function, asyncValidators: Function) {
        let control = new Control("", syncValidators, asyncValidators);
        control.updateValue(_.get(fieldConfig.model, fieldConfig.field), {
            onlySelf: false,
            emitEvent: false,
            emitModelToViewChange: true
        });
        return control;
    }
}
