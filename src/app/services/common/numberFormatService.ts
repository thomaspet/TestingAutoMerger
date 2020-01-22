import {INumberOptions} from '../../../framework/ui/uniform/index';
import {Injectable} from '@angular/core';

const HAIRSPACE = '\u200A';
const THINSPACE = ' ';

@Injectable()
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


    public asMoney(value: number, options?: INumberOptions): string {
        options = options || {};
        options = {
            thousandSeparator: typeof options.thousandSeparator === 'string' ? options.thousandSeparator : THINSPACE,
            decimalSeparator: options.decimalSeparator || ',',
            decimalLength: options.decimalLength === undefined ? 2 : options.decimalLength
        };

        return this.formatter(value, options);
    }

    public asOrgNo(value: number) {
        let _value: string = value + '';
        return _value.substr(0, 3) + THINSPACE + _value.substr(3, 3) + THINSPACE + _value.substr(6);
    }

    public asBankAcct(value: number) {
        if (value.toString().length !== 11) {
            return value.toString();
        }

        let _value: string = value + '';
        return _value.substr(0, 4) + '.' + _value.substr(4, 2) + '.' + _value.substr(6)
    }

    private formatter(value: number, options: INumberOptions) {
        if (!value && value !== 0) {
            return '';
        }

        let stringValue = value.toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(options.decimalLength);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

        stringValue = decimal ? (integer + options.decimalSeparator + decimal) : integer;
        return stringValue;
    }
}
