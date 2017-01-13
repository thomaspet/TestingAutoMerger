import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService} from '../services/services';

declare const moment;

@Pipe({name: 'unidateformat'})
export class UniDateFormatPipe implements PipeTransform {
    constructor(private errorService: ErrorService) {}
    public transform(value: Date | string): string {
        try {
            if (!value) {
                return '';
            }
            const date = moment(value);
            return date.format('DD.MM.YYYY');
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
