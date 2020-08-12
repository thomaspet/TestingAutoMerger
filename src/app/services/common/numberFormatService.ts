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

    public asBankAcct(value) {
        try {
            const valueAsString = value && value.toString();
            if (valueAsString && valueAsString.length === 11) {
                const match = /(\d{4})(\d{2})(\d{5})/.exec(valueAsString);
                if (match) {
                    return match.splice(1).join(' ');
                }
            }
            return value;
        } catch (err) {
            console.error(err);
            return value;
        }
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
