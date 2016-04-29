import {Validators} from 'angular2/common';
import {UniValidator} from '../validators';
import {FieldLayout} from '../../../app/unientities';
/**
 * Join (or Compose) Validators of a UniFieldBuilder
 */
export class ValidatorsComposer {

    public static composeSyncValidators(c: FieldLayout) {
        let validators = ValidatorsComposer.joinValidators(c.SyncValidators);
        return Validators.compose(validators);
    }

    public static composeAsyncValidators(c: FieldLayout) {
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
