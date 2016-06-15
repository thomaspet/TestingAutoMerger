import {Pipe, PipeTransform} from '@angular/core';
declare var moment;

@Pipe({
  name: 'isotime'
})
export class IsoTimePipe implements PipeTransform {
    public transform(value: any, format:string) {
        if (!value) return '';
        return moment(value).format(format || 'DD.MM.YYYY');
    }
}