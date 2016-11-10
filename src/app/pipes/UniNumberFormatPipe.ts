import { NumberFormat } from './../services/common/NumberFormatService';
import {Pipe, PipeTransform} from '@angular/core';

declare const moment;

@Pipe({name: 'uninumberformat'})
export class UniNumberFormatPipe implements PipeTransform {

    constructor( private numberFormat: NumberFormat ) { }
    public transform(value: number, format: string): string {

        if (!value) {
            return '';
        }

        switch (format) {
            case 'percentage':
                return this.numberFormat.asPercentage(value);
            case 'money':
                return this.numberFormat.asMoney(value);
            case 'orgno':
                return this.numberFormat.asOrgNo(value);
            default:
                return this.numberFormat.asNumber(value);
        }
    }
}
