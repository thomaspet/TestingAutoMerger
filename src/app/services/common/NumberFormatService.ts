import { INumberOptions } from './../../../framework/uniform/controls/numeric';
import {Injectable} from '@angular/core';

const HAIRSPACE = '\u200A';
const THINSPACE = '\u2009';

@Injectable()
export class NumberFormat {
    public asPercentage(value: number, options?: INumberOptions): string {
        return value + HAIRSPACE + '%';
    }

    public asNumber(value: number, options?: INumberOptions): string {
        options = options || {};
        options = {
            thousandSeparator: options.thousandSeparator || THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 2 : options.decimalLength
        };
        return this.formatter(value, options);
    }


    public asMoney(value: number, options?: INumberOptions): string {
        options = options || {};
        options = {
            thousandSeparator: options.thousandSeparator || THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 2 : options.decimalLength
        };

        return this.formatter(value, options);
    }

    private formatter(value: number, options: INumberOptions) {
        let stringValue = value.toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(options.decimalLength);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

        stringValue = decimal ? (integer + options.decimalSeparator + decimal) : integer;

        return stringValue;
    }
}
