import * as _ from 'lodash';
import { NumberFormat } from '@app/services/common/numberFormatService';

export function toNumber(value, options): number {
    if (_.isNumber(value)) {
        return value;
    }

    if (value === null || value === undefined) {
        return null;
    }

    if (options.thousandSeparator) {
        value = value.replace(options.thousandSeparator, '');
    }

    value = value.replace(' ', '');
    value = value.replace(',', '.');

    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
}

export function toString(value, options): string {
    if (!value || options.format === 'none') {
        return;
    }

    const decimals = value.toString().split('.')[1];
    let formatNumberOfDecimals = options.decimalLength;

    if (options.format === 'money') {
        // On format 'money' we dont want to force fewer decimals, only fill with 0s if
        // number of decimals is less than the defined number in companySettings.
        // This is to avoid confusion with sums etc that could arise if the actual number
        // contained more decimals than our format settings would display.
        if (decimals && decimals.length > options.decimalLength) {
            formatNumberOfDecimals = decimals.length;
        }
    }

    const parsed = toNumber((value || '').toString(), options);
    const formatter = new NumberFormat();
    let formatted = formatter.asNumber(parsed, {
        decimalLength: formatNumberOfDecimals,
        thousandSeparator: options.thousandSeparator
    });

    if (options.format === 'percent') {
        formatted = formatted + '%';
    }

    return formatted;
}
