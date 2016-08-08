import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'unicurrency'})
export class UniCurrencyPipe implements PipeTransform {
    public transform(value: number, numberOfDecimalPlaces?: number): string {
        const nrOfDecimal = numberOfDecimalPlaces || 2;
        const THOUSAND_SEPARATOR = '.';
        const DECIMAL_SEPARATOR = ',';
        const roundedNumber = this.round10(value, nrOfDecimal);
        const decimalCorrect = this.enforceDecimalPlaces(roundedNumber, nrOfDecimal);
        const thousandSeparatedNumber = this.insertThousandSeparator(decimalCorrect, THOUSAND_SEPARATOR, DECIMAL_SEPARATOR);
        return thousandSeparatedNumber;
    }

    private round10(value: any, exp: number): number {
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math.round(value);
        }

        value = +value;
        exp = +exp;

        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    }

    private insertThousandSeparator(value: number | string, thousandSeparator: string, decimalSeparator: string) {
        var parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
        return parts.join(decimalSeparator);
    }

    private enforceDecimalPlaces(value: number, numberOfDecimals: number): string {
        const numberAndDecimal = value.toString().split('.');
        const integer = numberAndDecimal[0];
        const fractional = numberAndDecimal[1] || '';
        return integer + '.' + fractional + '0'.repeat(numberOfDecimals - fractional.length);
    }
}
