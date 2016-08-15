import {Validators} from '@angular/forms';
import {UniValidator} from '../validators';
import {UniFieldLayout} from '../interfaces';
/**
 * Join (or Compose) Validators of a UniFieldBuilder
 */
export class ValidatorsComposer {

    public static composeSyncValidators(c: UniFieldLayout) {
        let validators = ValidatorsComposer.joinValidators(c.SyncValidators);
        return Validators.compose(validators);
    }

    public static composeAsyncValidators(c: UniFieldLayout) {
        let validators = ValidatorsComposer.joinValidators(c.AsyncValidators);
        return Validators.composeAsync(validators);
    }

    private static joinValidators(validators: any[]) {
        let list = [];
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator: any) => {
                var v = new UniValidator(validator);
                list.push(v.Validator);

            });
        }
        return list;
    }

}
