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
        var parsed = this.parse(value);
        switch (format) {
            case 'short':
                return this.shortFmt(parsed.hours, parsed.minutes);
            default:
                return this.longFmt(parsed.hours, parsed.minutes);
        }        
    }

    private parse(value: any):{ hours:number, minutes:number } {
        var defaultValue = { hours:0, minutes: 0 };
        if (value===null) return defaultValue;
        if (!value) return defaultValue;
        var hours = 0;
        var minutes = parseInt(value);
        if (minutes===0) return defaultValue;
        if (minutes>=60) {
            hours = Math.floor(minutes / 60)
            minutes = minutes % 60;
        }
        return { hours: hours, minutes: minutes };        
    }

    private longFmt(hours:number, minutes:number): string {
        return (hours > 0 ? hours + ' timer ' : '') + (minutes!==0 ? (hours>0 ? ' og ' : '') + minutes + ' minutter' : '');
    }

    private shortFmt(hours:number, minutes:number): string {
        return hours + ' : ' + (minutes<10 ? '0' : '') + minutes;
    }

}