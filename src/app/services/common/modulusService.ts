import {Injectable} from '@angular/core';
import {UniFieldLayout, UniFormError} from '../../../framework/ui/uniform/index';


export interface ICheckSums {
    checkSum1: number;
    checkSum2: number;
}
@Injectable()
export class ModulusService {
    constructor() { }

    public validSSN(ssn: string): boolean {
        return this.standardChecksOK(ssn) && this.checkSSNCheckSums(ssn);
    }

    public getSSNMod11CheckSums(ssn: string): ICheckSums {
        const checkSums: ICheckSums = {checkSum1: 0, checkSum2: 0};
        const ssnList: number[] = [];
        const checkDigit1Factors = [
            3, 7, 6, 1, 8, 9, 4, 5, 2
        ];
        const checkDigit2Factors = [
            5, 4, 3, 2, 7, 6, 5, 4, 3
        ];

        ssn.split('').forEach(digit => {
            ssnList.push(+digit);
        });

        checkDigit1Factors.forEach((digit, i) => {
            checkSums.checkSum1 += digit * ssnList[i];
            checkSums.checkSum2 += checkDigit2Factors[i] * ssnList[i];
        });

        checkSums.checkSum1 = 11 - (checkSums.checkSum1 % 11);

        checkSums.checkSum2 += 2 * checkSums.checkSum1;
        checkSums.checkSum2 = 11 - (checkSums.checkSum2 % 11);

        if (checkSums.checkSum1 === 11) {
            checkSums.checkSum1 = 0;
        }
        if (checkSums.checkSum2 === 11) {
            checkSums.checkSum2 = 0;
        }

        return checkSums;
    }

    public isValidKID(KID: string): boolean {
        if (KID) {
            return !KID
            .split('')
            .some(x => isNaN(+x)) && (this.modulus10(KID) || this.modulus11(KID));
        }
        return true;
    }

    public formValidationKID = (KID: string, field: UniFieldLayout): UniFormError | null => {
        if (!KID || typeof KID !== 'string' || this.isValidKID(KID)) {
            return null;
        }

        return {
            value: KID,
            errorMessage: 'KID-nr. er ikke gyldig',
            field: field,
            isWarning: true
        };
    }

    public orgNrValidationUniForm = (orgNr: string, field: UniFieldLayout, international?: boolean): UniFormError | null => {
        if (international) {
            return null;
        }

        if (!orgNr || typeof orgNr !== 'string' || this.isValidOrgNr(orgNr)) {
            return null;
        }

        return {
            value: orgNr,
            errorMessage: 'Ugyldig orgnr.',
            field: field,
            isWarning: true
        };
    }

    public isValidOrgNr(orgNr: string): boolean {
        if (orgNr) {
            if (isNaN(parseInt(orgNr, 10))) {
                return false;
            }

            if (orgNr.length !== 9) {
                return false;
            }

            return this.modulus11(orgNr);
        } else {
            return true;
        }
    }

    private checkSSNCheckSums(ssn: string) {
        const checkSums = this.getSSNMod11CheckSums(ssn);
        return +ssn.charAt(ssn.length - 2) === checkSums.checkSum1
        && +ssn.charAt(ssn.length - 1) === checkSums.checkSum2;
    }

    private standardChecksOK(numberToCheck: string): boolean {
        if (!numberToCheck) {
            return false;
        }

        numberToCheck = this.removeStandardSeparators(numberToCheck);
        return (numberToCheck.length === 11 && !isNaN(+numberToCheck));
    }

    private removeStandardSeparators(numberToCheck: string) {
        return this.removeSeparators(numberToCheck, [' ', '.']);
    }
    private removeSeparators(numberToCheck: string, charsToRemove: string[]) {
        const cleaned = numberToCheck;
        charsToRemove.forEach(char => cleaned.replace(char, ''));
        return cleaned;
    }


    // algoritms to check if last digit in KID/SSN (the control digit) is valid against the rest

    private modulus10(value: string): boolean {
        const sum = value
            .split('')
            .filter(x => !isNaN(+x))
            .reverse()
            .map((val, i) => +val * (i % 2 + 1))
            .reduce((acc, val) => acc + Math.floor(val / 10) + val % 10, 0);
        return !(sum % 10);
    }

    private modulus11(input: string): boolean {
        let controlNumber = 2,
            sumForMod = 0,
            i;

        for (i = input.length - 2; i >= 0; --i) {
            sumForMod += (+input.charAt(i)) * controlNumber;
            if (++controlNumber > 7) {
                controlNumber = 2;
            }
        }

        let controlDigit = (11 - sumForMod % 11);
        if (controlDigit === 11) {
            controlDigit = 0;
        }

        return controlDigit === parseInt(input.charAt(input.length - 1), 10);
    }
}
