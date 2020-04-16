import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeLeave, Leavetype} from '../../../unientities';

@Injectable()
export class EmployeeLeaveService extends BizHttp<EmployeeLeave> {
    private leaveTypes: {ID: number, text: string}[] = [
        {ID: Leavetype.NotSet, text: 'Ikke valgt'},
        {ID: Leavetype.Leave, text: 'Permisjon'},
        {ID: Leavetype.LayOff, text: 'Permittering'},
        {ID: Leavetype.Leave_with_parental_benefit, text: 'Permisjon med foreldrepenger'},
        {ID: Leavetype.Military_service_leave, text: 'Permisjon ved militærtjeneste'},
        {ID: Leavetype.Educational_leave, text: 'Utdanningspermisjon'},
        {ID: Leavetype.Compassionate_leave, text: 'Velferdspermisjon'}
    ];
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeLeave.RelativeUrl;
        this.entityType = EmployeeLeave.EntityType;
    }

    public getOnlyNewTypes() {
        return this.leaveTypes.filter(x => x.ID !== Leavetype.Leave);
    }
}
