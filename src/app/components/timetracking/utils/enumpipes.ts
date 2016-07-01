import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'worktypesystemtype'
})
export class WorkTypeSystemType implements PipeTransform {
    public transform(value: any, format:string) {
        var ret = '';
        switch (value) {
            case 1:
                return 'Timer';
            case 2:
                return 'Fri';
            case 3:
                return 'Fleksitid';
            case 4:
                return 'Overtid';
            case 5:
                return 'Ferie';
            default:
                return value || '';
        }
    }
}
