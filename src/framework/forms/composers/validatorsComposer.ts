import {Validators} from "angular2/common";
import {UniFieldBuilder} from "./../builders/uniFieldBuilder";
import {UniValidator} from "../../validators/UniValidator";

/**
 * Join (or Compose) Validators of a UniFieldBuilder
 */
export class ValidatorsComposer {

    public static composeSyncValidators(c: UniFieldBuilder) {
        let validators = ValidatorsComposer.joinValidators(c.syncValidators);
        return Validators.compose(validators);
    }

    public static composeAsyncValidators(c: UniFieldBuilder) {
        let validators = ValidatorsComposer.joinValidators(c.asyncValidators);
        return Validators.composeAsync(validators);
    }

    private static joinValidators(validators: UniValidator[]) {
        let list = [];
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator: UniValidator) => {
                list.push(validator.Validator);

            });
        }
        return list;
    }

}
