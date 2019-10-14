import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {NO} from '../../../assets/locale/no_uni';
import {OVERRIDE} from '../../../assets/locale/override';
import {EN} from '../../../assets/locale/en';

@Injectable()
export  class UniTranslationService {
    locale: BehaviorSubject<string> = new BehaviorSubject('NO');
    DICTIONARY: any = {
        NO: NO,
        EN: EN,
        OVERRIDE: OVERRIDE
    };

    constructor() {
        this.locale.next(localStorage.getItem('TRANSLATE_LOCALE') || 'NO');
    }

    public translate(stringToTranslate: string, params?: any, options?: any): string {
        if (!this.locale || !stringToTranslate) {
            return stringToTranslate || '';
        }

        // Find params from the translation string. The param values are declared a ~
        let paramsInString = stringToTranslate.split('~');
        if (paramsInString.length > 1) {
            stringToTranslate = paramsInString[0];
            paramsInString.shift();
        } else {
            paramsInString = [];
        }

        let translation = _.get(this.DICTIONARY.OVERRIDE, stringToTranslate)
            || _.get(this.DICTIONARY[this.locale.getValue()], stringToTranslate);

        if (translation && translation.includes('{') && translation.includes('}')) {
            paramsInString.forEach(paramValue => {
                translation = translation.replace(/\{.*?\}/, paramValue || '');
            });
        }

        return translation || stringToTranslate;
    }

    public setLocale(locale: string) {
        this.locale.next(locale);
        localStorage.setItem('TRANSLATE_LOCALE', locale);
    }
}
