import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService, NumberFormat} from '../services/services';

declare const moment;

@Pipe({name: 'uninumberformat'})
export class UniNumberFormatPipe implements PipeTransform {

    constructor( private numberFormat: NumberFormat, private errorService: ErrorService) { }
    public transform(value: number, format: string): string {
        try {
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
                case 'bankacct':
                    return this.numberFormat.asBankAcct(value);
                default:
                    return this.numberFormat.asNumber(value);
            }
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
