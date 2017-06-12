import { Injectable } from '@angular/core';

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
        let checkSums: ICheckSums = {checkSum1: 0, checkSum2: 0};
        let ssnList: number[] = [];
        let checkDigit1Factors = [
            3, 7, 6, 1, 8, 9, 4, 5, 2
        ];
        let checkDigit2Factors = [
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

    public isValidKID(KID: string) {
        return !KID
            .split('')
            .some(x => isNaN(+x)) && this.modulus10(KID);
    }

    private checkSSNCheckSums(ssn: string) {
        let checkSums = this.getSSNMod11CheckSums(ssn);
        return +ssn.charAt(ssn.length - 2) === checkSums.checkSum1 
        && +ssn.charAt(ssn.length - 1) === checkSums.checkSum2;
    }

    private standardChecksOK(numberToCheck: string): boolean{
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
        let cleaned = numberToCheck;
        charsToRemove.forEach(char => cleaned.replace(char, ''));
        return cleaned;
    }

    private modulus10(value: string): boolean {
        let sum = value
            .split('')
            .filter(x => !isNaN(+x))
            .reverse()
            .map((val, i) => +val * (i % 2 + 1))
            .reduce((acc, val) => acc + Math.floor(val / 10) + val % 10, 0);
        return !(sum % 10);
    }


}
