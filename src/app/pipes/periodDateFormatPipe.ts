import {Pipe, PipeTransform} from '@angular/core';
import {Period} from '../unientities';
import {ErrorService} from '../services/services';
import * as moment from 'moment';

@Pipe({name: 'periodDateFormat'})
export class PeriodDateFormatPipe implements PipeTransform {
    constructor(private errorService: ErrorService) {}
    public transform(period?: Period): string {
        try {
            if (!period) {
                return '';
            }
            const from = moment(period.FromDate);
            const to = moment(period.ToDate);
            const length = to.diff(from, 'days');
            if (length < 32) { // One month period
                return this.capitalize(from.format('MMMM')) + to.format(' YYYY');
            } else if (length < 366) { // More than one month period
                return this.capitalize(from.format('MMMM')) + to.format('-MMMM YYYY');
            } else { // Year period
                return from.format('YYYY');
            }
        } catch (err) {
            this.errorService.handle(err);
        }
    }

    private capitalize(source: string): string {
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
}
