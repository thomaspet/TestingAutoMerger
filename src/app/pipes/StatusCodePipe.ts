import {Pipe, PipeTransform} from '@angular/core';

// TODO: this enum should come from backend
enum StatusCode {
    Draft = 10001,
    Pending = 20001,
    Active = 30001,
    Completed = 40001,
    InActive = 50001,
    Deviation = 60001,
    Error = 70001,
    Deleted = 90001
}

@Pipe({name: 'unistatuscode'})
export class UniStatusCodePipe implements PipeTransform {

    constructor() {}
    public transform(value: number): string {
        let status = '';
        switch (value) {
            case StatusCode.Draft: status = 'Kladd'; break;
            case StatusCode.Pending: status = 'Påvente'; break;
            case StatusCode.Active: status = 'Aktiv'; break;
            case StatusCode.Completed: status = 'Fullført'; break;
            case StatusCode.InActive: status = 'Avvik'; break;
            case StatusCode.Deviation: status = 'Inaktiv'; break;
            case StatusCode.Error: status = 'Feilet'; break;
            case StatusCode.Deleted: status = 'Sletet'; break;
        }
        return status;
    }

}
