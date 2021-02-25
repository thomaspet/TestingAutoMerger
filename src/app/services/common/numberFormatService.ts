import {INumberOptions} from '../../../framework/ui/uniform/index';
import {Injectable} from '@angular/core';

const HAIRSPACE = '\u200A';
const THINSPACE = ' ';

@Injectable({ providedIn: 'root' })
export class NumberFormat {
    public asPercentage(value: number, options: INumberOptions = {}): string {
        options = {
            thousandSeparator: typeof options.thousandSeparator === 'string' ? options.thousandSeparator : THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 0 : options.decimalLength
        };
        return this.formatter(value, options) + HAIRSPACE + '%';
    }

    public asNumber(value: number, options?: INumberOptions): string {
        options = options || {};
        options = {
            thousandSeparator: typeof options.thousandSeparator === 'string' ? options.thousandSeparator : THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 2 : options.decimalLength
        };
        return this.formatter(value, options);
    }


    public asMoney(value: number, options?: INumberOptions, showNullAsZero = false): string {
        options = options || {};
        options = {
            thousandSeparator: typeof options.thousandSeparator === 'string' ? options.thousandSeparator : THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 2 : options.decimalLength
        };

        return this.formatter(value, options, showNullAsZero);
    }

    public asOrgNo(value: number) {
        let _value: string = value + '';
        return _value.substr(0, 3) + THINSPACE + _value.substr(3, 3) + THINSPACE + _value.substr(6);
    }

    public asBankAcct(value) {
        try {
            const valueAsString = value && value.toString();

            if (valueAsString && valueAsString.length === 11) {
                // return format 1503 50 26780 (with space)
                return `${valueAsString.slice(0, 4)}${THINSPACE}${valueAsString.slice(4, 6)}${THINSPACE}${valueAsString.slice(6, 11)}`;
            }

            if (valueAsString && valueAsString.length >= 15) {
                // Format to 4 numbers + space + ... + last chars 
                // e.g NO87 9710 1444 760

                const parts = [];

                for (let i = 0; i < valueAsString.length; i += 4) {
                    parts.push(valueAsString.slice(i, i + 4));
                }

                return parts.join(THINSPACE);
            }

            return value || '';
        } catch (err) {
            console.error(err);
            return value;
        }
    }

    private formatter(value: number, options: INumberOptions, showNullAsZero = false) {
        if (!value && value !== 0 && !showNullAsZero) {
            return '';
        }

        let stringValue = (value || 0).toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(options.decimalLength);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

        stringValue = decimal ? (integer + options.decimalSeparator + decimal) : integer;
        return stringValue;
    }
}
