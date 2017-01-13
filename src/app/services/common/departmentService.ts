import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Department} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

export class DepartmentService extends BizHttp<Department> {

    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);

        this.relativeURL = Department.RelativeUrl;
        this.entityType = Department.EntityType;
        this.DefaultOrderBy = null;
    }
}
