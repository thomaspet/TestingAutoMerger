import {Validators} from "angular2/common";
import {UniInputBuilder} from "./../builders/uniInputBuilder";

/**
 * Join (or Compose) Validators of a UniInputBuilder
 */
export class ValidatorsComposer {

    public static composeSyncValidators(c: UniInputBuilder) {
        let validators = ValidatorsComposer.joinValidators(c.syncValidators);
        return Validators.compose(validators);
    }

    public static composeAsyncValidators(c: UniInputBuilder) {
        let validators = ValidatorsComposer.joinValidators(c.asyncValidators);
        return Validators.composeAsync(validators);
    }

    private static joinValidators(validators: any[]) {
        let list = [];
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator: any) => {
                list.push(validator.validator);

            });
        }
        return list;
    }

}
