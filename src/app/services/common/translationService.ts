import {Injectable} from '@angular/core';
import {get} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {NO, EN} from 'src/translations';
import {theme} from 'src/themes/theme';

@Injectable()
export  class UniTranslationService {
    locale: BehaviorSubject<string> = new BehaviorSubject('NO');
    overrides = theme.translationOverrides || {};

    DICTIONARY: any = {
        NO: NO,
        EN: EN,
    };

    constructor() {
        this.locale.next(localStorage.getItem('TRANSLATE_LOCALE_NEW') || 'NO');

        if (!this.DICTIONARY[this.locale.getValue()]) {
            this.setLocale('NO');
        }
    }

    public translate(stringToTranslate: string, params?: any, options?: any): string {
        if (!this.locale || !stringToTranslate) {
            return stringToTranslate || '';
        }

        // Guard for numbers, split fail when clean number
        if (typeof stringToTranslate === 'number') {
            stringToTranslate = parseFloat(stringToTranslate).toString();
        }

        // Find params from the translation string. The param values are declared after a ~
        let paramsInString = stringToTranslate.split('~');
        if (paramsInString.length > 1) {
            stringToTranslate = paramsInString[0];
            paramsInString.shift();
        } else {
            paramsInString = [];
        }

        let translation = get(this.overrides, stringToTranslate)
            || get(this.DICTIONARY[this.locale.getValue()], stringToTranslate);

        if (translation && translation.includes('{') && translation.includes('}')) {
            paramsInString.forEach(paramValue => {
                translation = translation.replace(/\{.*?\}/, paramValue || '');
            });
        }

        return translation || stringToTranslate;
    }

    public setLocale(locale: string) {
        this.locale.next(locale);
        localStorage.setItem('TRANSLATE_LOCALE_NEW', locale);
    }
}
