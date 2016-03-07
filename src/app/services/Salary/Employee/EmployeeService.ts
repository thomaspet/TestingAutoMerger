import {Injectable} from 'angular2/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {IEmployee} from '../../../../framework/interfaces/interfaces';

@Injectable()
export class EmployeeService extends BizHttp<IEmployee> {

    constructor(http:UniHttp) {
        super(http);
        this.RelativeURL = 'Employees';
    }

}
