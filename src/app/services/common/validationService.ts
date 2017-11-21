import {Injectable} from '@angular/core';
import {ModulusService} from './modulusService';
import * as moment from 'moment';

declare const _; // lodash

@Injectable()
export class ValidationService {
    constructor(private modulusService: ModulusService) {}

    public isDate(value: string): boolean {
        if (moment(value, 'YYYY-MM-DD', true).isValid()) {
            return true;
        }

        let sanitized = this.getSanitizedDate(value);
        return moment(sanitized, 'YYYY-MM-DD', true).isValid();
    }

    public getSanitizedDate(value: string): string {
        // check different formats, etc, and convert to YYYY-MM-DD
        // Supports these formats: DD.MM.YYYY, YYYY-MM-DD, DD.MM.YY, YY-MM-DD
        let sanitized = null;

        let formats: Array<string> = ['DD.MM.YYYY', 'YYYY-MM-DD', 'DD.MM.YY', 'YY-MM-DD'];

        for (let i = 0; i < formats.length; i++) {
            if (moment(value, formats[i], true).isValid()) {
                sanitized = moment(value, formats[i], true).format('YYYY-MM-DD');
                return sanitized;
            }
        }

        return sanitized;
    }

    public isNumber(value: string): boolean {
        if (!isNaN(<any>value)) {
            return true;
        }
        let sanitized = this.getSanitizedNumber(value);

        return !isNaN(<any>sanitized);
    }

    public getSanitizedNumber(value: string): string {
        // sanitize amounts with value e.g. 25.123,84 by removing thousand separator(s)
        let sanitized = value;

        if (sanitized.indexOf(',') !== -1 && sanitized.indexOf('.') !== -1) {
            sanitized =
                sanitized.replace(
                    (sanitized.indexOf('.') < sanitized.indexOf(',') ? /\./g : /,/g), '');
        }

        if (sanitized.indexOf(' ') !== -1) {
            sanitized.replace(/ /g, '');
        }

        sanitized = sanitized.replace(/,/g, '.');

        return sanitized;
    }

    public isStringWithOnlyNumbers(value: string): boolean {
        return /^[0-9]+$/.test(value);
    }

    public isBankAccountNumber(value: string): boolean {
        let valid = value && /^\d{11}$/.test(value);

        if (!valid) {
            let sanitized = this.getSanitizedBankAccount(value);
            valid = sanitized && /^\d{11}$/.test(sanitized);
        }

        return valid;
    }

    public getSanitizedBankAccount(value: string): string {
        return value ? value.replace(/ /g, '').replace(/\./g, '') : null;
    }

    public isKidNumber(value: string): boolean {
        // validate that the string only contains numbers and run a modulus check
        if (!this.isStringWithOnlyNumbers(value)) {
            return false;
        }

        return this.modulusService.isValidKID(value);
    }
}
