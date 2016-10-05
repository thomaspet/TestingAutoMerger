import {Pipe, PipeTransform} from '@angular/core';

declare const moment;

@Pipe({name: 'unidateformat'})
export class UniDateFormatPipe implements PipeTransform {
    public transform(value: Date | string): string {
        if (!value) {
            return '';
        }
        const date = moment(value);
        return date.format('DD.MM.YYYY');
    }
}
