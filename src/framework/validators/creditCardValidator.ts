import {RegExpWrapper, isPresent} from 'angular2/src/facade/lang';

export function creditCardValidator(c): {[key: string]: boolean} {
    if (isPresent(c.value) && RegExpWrapper.test(/^\d{16}$/g, c.value)) {
        return null;
    } else {
        return {"invalidCreditCard": true};
    }
}
