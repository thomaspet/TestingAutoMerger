import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'uniaccounttype'})
export class UniAccountTypePipe implements PipeTransform {
    transform(type: string): string {
        switch (type?.toLowerCase()) {
            case 'company':
            case 'companysettings':
                return 'Drift';
            case 'tax':
                return 'Skatt';
            case 'salary':
                return 'Lønn';
            case 'credit':
                return 'Kredittkort';
            case 'international':
                return 'Utenlandsbetaling';
            default:
                return '';
        }
    }
}
