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

@Pipe({
  name: 'min2hours'
})
export class MinutesToHoursPipe implements PipeTransform {
    public transform(value: any, format?:string) {
        if (!value) return '0 timer';
        var minutes = parseInt(value);
        if (minutes===0) return '0 timer';
        var ret = "";
        if (minutes>=60) {
            ret = Math.floor(minutes / 60) + ' timer';
            minutes = minutes % 60;
        }
        return ret + (minutes!==0 ? ' og ' + minutes + ' minutter' : '');
    }
}