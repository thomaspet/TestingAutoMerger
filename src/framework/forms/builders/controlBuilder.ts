import {Control} from "@angular/common";
import {UniFieldBuilder} from "./uniFieldBuilder";

declare var _;

export class ControlBuilder {
    static build(fieldConfig: UniFieldBuilder, syncValidators: any, asyncValidators: any) {
        let control = new Control("", syncValidators, asyncValidators);
        control.updateValue(_.get(fieldConfig.model, fieldConfig.field), {
            onlySelf: false,
            emitEvent: false,
            emitModelToViewChange: true
        });
        return control;
    }
}
