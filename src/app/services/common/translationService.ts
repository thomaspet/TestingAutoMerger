import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {NO_UNI} from '../../../assets/locale/no_uni';
import {NO_SR} from '../../../assets/locale/no_sr';
import {EN} from '../../../assets/locale/en';

@Injectable()
export  class UniTranslationService {
    locale: BehaviorSubject<string> = new BehaviorSubject('NO_UNI');
    DICTIONARY: any = {
        NO_UNI: NO_UNI,
        NO_SR: NO_SR,
        EN: EN
    };

    constructor() {
        this.locale.next(localStorage.getItem('TRANSLATE_LOCALE') || 'NO_UNI');
    }

    public translate(stringToTranslate: string, params?: any, options?: any): string {
        if (!this.locale || !stringToTranslate) {
            return stringToTranslate || '';
        }

        let translation = _.get(this.DICTIONARY[this.locale.getValue()], stringToTranslate);

        if (translation && translation.indexOf(':param') > -1) {
            translation = translation.replace(':param', params || '');
        }

        return translation || stringToTranslate;
    }

    public setLocale(locale) {
        this.locale.next(locale);
        localStorage.setItem('TRANSLATE_LOCALE', locale);
    }
}
