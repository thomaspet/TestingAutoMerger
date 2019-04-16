import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Department} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { Observable } from 'rxjs';
import { RequestMethod } from '@angular/http';

@Injectable()
export class DepartmentService extends BizHttp<Department> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Department.RelativeUrl;
        this.entityType = Department.EntityType;
        this.DefaultOrderBy = null;
    }

    public checkIfUsed(id: number): Observable<any> {
        return this.ActionWithBody(id, null, 'is-used', RequestMethod.Get);
    }

}
