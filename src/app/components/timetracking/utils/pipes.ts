import {Pipe, PipeTransform} from '@angular/core';
declare var moment;

interface ITime { 
    hours: number;
    minutes: number;
    preSign: string;
    decimal: number; 
}

export var SYSTEMTYPES = [
    { id: 1, label: 'Timer' },
    { id: 9, label: 'Fri (med lønn)' },
    { id: 10, label: 'Fri (uten lønn)' },
    { id: 11, label: 'Fleksitid' },
    { id: 12, label: 'Overtid' },
    { id: 13, label: 'Ferie' },
    { id: 20, label: 'Sykdom' }
];

@Pipe({
  name: 'isotime'
})
export class IsoTimePipe implements PipeTransform {
    public transform(value: any, format: string) {
        if (!value) { return ''; }
        return moment(value).format(format || 'DD.MM.YYYY');
    }
}

@Pipe({
  name: 'min2hours'
})
export class MinutesToHoursPipe implements PipeTransform {

    public transform(value: any, format?: string) {
        var parsed = this.parse(value);
        switch (format) {
            case 'short':
                return this.shortFmt(parsed);
            case 'decimal':
                return this.decFmt(parsed);
            default:
                return this.longFmt(parsed);
        }        
    }

    private parse(value: any): ITime {
        var defaultValue = { hours: 0, minutes: 0, preSign: '', decimal: 0 };
        if (value === null) { return  defaultValue; }
        if (!value) { return defaultValue; }
        var hours = 0;
        var minutes = parseInt(value);
        var dec = parseFloat((minutes / 60).toFixed(1));
        var preSign = '';
        if (minutes < 0) {
            minutes = -minutes;
            preSign = '-';
        }
        if (minutes === 0) { return defaultValue; }
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
        }
        return { hours: hours, minutes: minutes, preSign: preSign, decimal: dec };        
    }

    private longFmt(time: ITime): string {
        return time.preSign + (time.hours > 0 ? time.hours + ' timer ' : '') + (time.minutes !== 0 ? (time.hours > 0 ? ' og ' : '') + time.minutes + ' minutter' : '');
    }

    private shortFmt(time: ITime): string {
        if (time.hours === 0 && time.minutes === 0) { return ''; }
        return time.preSign + time.hours + ' : ' + (time.minutes < 10 ? '0' : '') + time.minutes;
    }

    private decFmt(time: ITime): string {        
        return time.decimal.toFixed(1);        
    }

}


@Pipe({
  name: 'worktypesystemtype'
})
export class WorkTypeSystemTypePipe implements PipeTransform {
    public transform(value: any, format: string) {
        var iVal = parseInt(value);
        for (var i = 0; i < SYSTEMTYPES.length; i++) {
            if (SYSTEMTYPES[i].id === iVal) {
                return SYSTEMTYPES[i].label;
            }
        }
        return value || '';
    }
}
