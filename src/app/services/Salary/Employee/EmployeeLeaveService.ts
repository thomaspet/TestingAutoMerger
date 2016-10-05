import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeLeave} from '../../../unientities';

@Injectable()
export class EmployeeLeaveService extends BizHttp<EmployeeLeave> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeLeave.RelativeUrl;
        this.entityType = EmployeeLeave.EntityType;
    }
    
}
