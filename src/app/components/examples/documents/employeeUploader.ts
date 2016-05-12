import {Injectable} from '@angular/core';
import {FileUploadService} from '../../../../framework/documents/index';
import {Employee} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';

@Injectable()
export class EmployeeFileUploader extends FileUploadService<Employee> {
    constructor(protected $http: UniHttp) {
        super($http);
        this.entityType = Employee.entityType;
    }
}