import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee} from '../../../unientities';

export class EmployeeService extends BizHttp<Employee> {

    constructor(http:UniHttp) {
        super(http);
        this.relativeURL = Employee.relativeUrl;
    }

}
