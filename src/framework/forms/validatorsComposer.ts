import {Validators} from 'angular2/common';

export class ValidatorsComposer {

    public static composeSyncValidators(c) {
        let validators = ValidatorsComposer.joinValidators(c.syncValidators);
        return Validators.compose(validators);
    }

    public static composeAsyncValidators(c) {
        let validators = ValidatorsComposer.joinValidators(c.asyncValidators);
        return Validators.composeAsync(validators);
    }

    private static joinValidators(validators) {
        let list = [];
        if (validators && Array.isArray(validators)) {
            validators.forEach((validator:any)=> {
                list.push(validator.validator);

            });
        }
        return list;
    }

}
