import {RegExpWrapper, isPresent} from 'angular2/src/facade/lang';

export function emailValidator(c): {[key: string]: boolean} {
    let emailRegex = /\S+@\S+\.\S+/;
    if (isPresent(c.value) && RegExpWrapper.test(emailRegex, c.value)) {
        return null;
    } else {
        return {"invalidEmail": true};
    }
}
