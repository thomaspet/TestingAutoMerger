import {BaseApiService} from '../../../../framework/core/BaseApiService';
import {IAccount} from '../../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../../framework/core/http';
import {IEmployee} from "../../../../framework/interfaces/interfaces";

export class EmployeeService extends BaseApiService<IEmployee> {

    constructor(http: UniHttp) {
        super(http);
        this.RelativeURL = 'Employees';
    }
}
