import {Pipe, PipeTransform} from '@angular/core';
import {UniTableColumnType} from './config/unitableColumn';
import * as moment from 'moment';
import * as Immutable from 'immutable';

@Pipe({
  name: 'unitablepipe'
})
export class UniTablePipe implements PipeTransform {
    private numericColTypes = [
        UniTableColumnType.Number,
        UniTableColumnType.Money,
        UniTableColumnType.Percent
    ];

    public transform(value: any, column: Immutable.Map<any, any>) {
        try {
            let parsedValue: any;

            if (!column) {
                return '';
            }

            // check if a custom pipe
            if (column.get('template')) {
                parsedValue = column.get('template')(value.toJS());
            } else if (column.get('displayField') && column.get('displayField') !== '') {
                // use displayField
                let val = this.getDeepValueFromMap(value, column.get('displayField'));
                parsedValue = val;
            } else if (column.get('alias') && column.get('alias') !== '') {
                // use alias
                let val = this.getDeepValueFromMap(value, column.get('alias'));
                parsedValue = val;
            } else {
                // get value - check for deep level properties
                let val = this.getDeepValueFromMap(value, column.get('field'));
                parsedValue = val;
            }


            const colType = column.get('type');
            if (colType === UniTableColumnType.DateTime && parsedValue) {
                parsedValue = moment(parsedValue).format(column.get('format') || 'DD.MM.YYYY');
                if (parsedValue === 'Invalid date') {
                    parsedValue = '';
                }
            }

            if (colType === UniTableColumnType.LocalDate && parsedValue) {
                const date = parsedValue.toDate ? parsedValue.toDate() : parsedValue;
                parsedValue = moment(date).format(column.get('format') || 'DD.MM.YYYY');
                if (parsedValue === 'Invalid date') {
                    parsedValue = '';
                }
            }

            if (colType === UniTableColumnType.Boolean && typeof parsedValue !== 'undefined') {
                if (typeof parsedValue === 'boolean') {
                    parsedValue = parsedValue ? 'Ja' : 'Nei';
                }
            }

            if (this.numericColTypes.indexOf(colType) >= 0 && parsedValue) {
                let format = column.get('numberFormat');

                if (format.decimalLength >= 0) {
                    parsedValue = parseFloat(parsedValue).toFixed(format.decimalLength);
                }

                let [integer, decimal] = parsedValue.toString().split('.');
                integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandSeparator);

                if (decimal && decimal.length) {
                    parsedValue = `${integer}${format.decimalSeparator}${decimal}`;
                } else {
                    parsedValue = integer;
                }

                parsedValue = `${format.prefix || ''}${parsedValue}${format.postfix || ''}`;
            }

            return parsedValue || '';
        } catch(e) {
            console.error('THE UNI-TABLE PIPE CRASHED!!!', e);
            return '[UNI-TABLE PIPE ERROR]';
        }
    }

    public getDeepValueFromMap(value: any, path: string): any {
        let val = value.getIn(path.split('.'));
        return val;
    }

}
