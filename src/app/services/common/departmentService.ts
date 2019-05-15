import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Department} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class DepartmentService extends BizHttp<Department> {

    constructor(http: UniHttp) {
        super(http);

        this.relativeURL = Department.RelativeUrl;
        this.entityType = Department.EntityType;
        this.DefaultOrderBy = null;
    }

}
