import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService} from '../services/services';
import * as moment from 'moment';

@Pipe({name: 'unidateformat'})
export class UniDateFormatPipe implements PipeTransform {
    constructor(private errorService: ErrorService) {}
    public transform(value: Date | string, format = 'DD.MM.YYYY'): string {
        try {
            if (!value) {
                return '';
            }

            return moment(value).format(format);
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
