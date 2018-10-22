import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationRateEmployee} from '../../../unientities';
import {Observable} from 'rxjs';

@Injectable()
export class VacationRateEmployeeService extends BizHttp<VacationRateEmployee> {
    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = VacationRateEmployee.RelativeUrl;
        this.entityType = VacationRateEmployee.EntityType;
    }

    // public save(empID: number, empRate: number, empRate60: number): Observable<VacationRateEmployee> {
    //     return empRate ? super.Put(empRate.ID, empRate) : super.Post(empRate);
    // }
}
