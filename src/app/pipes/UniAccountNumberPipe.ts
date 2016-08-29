import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'uniaccountnumber'})
export class UniAccountNumberPipe implements PipeTransform {
    public transform(value: string): string {
        if (value && value.length === 11) {
            const match = /(\d{4})(\d{2})(\d{5})/.exec(value);
            if (match) {
                return match.splice(1).join(' ');
            }
        }
        return value;
    }
}
