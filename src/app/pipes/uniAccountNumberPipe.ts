import {Pipe, PipeTransform} from '@angular/core';
import {ErrorService} from '../services/services';

@Pipe({name: 'uniaccountnumber'})
export class UniAccountNumberPipe implements PipeTransform {
    constructor(private errorService: ErrorService) {}
    public transform(value: string): string {
        try {
            if (value && value.length === 11) {
                const match = /(\d{4})(\d{2})(\d{5})/.exec(value);
                if (match) {
                    return match.splice(1).join(' ');
                }
            }
            return value;
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
