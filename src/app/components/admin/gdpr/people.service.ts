import {Injectable} from '@angular/core';
import {CustomerService} from '@app/services/sales/customerService';
import {HttpParams} from '@angular/common/http';
import { SupplierService } from '@app/services/accounting/supplierService';
import { Observable } from 'rxjs';
import { ContactService } from '@app/services/common/contactService';
import { EmployeeService } from '@app/services/salary/employee/employeeService';
import { WorkerService } from '@app/services/timetracking/workerService';

const expand = [
    'Info',
    'Info.Phones',
    'Info.Emails',
    'Info.Addresses',
    'Info.DefaultEmail',
    'Info.DefaultPhone',
    'Info.ShippingAddress',
    'Info.InvoiceAddress'
].join(',');

const employeesExpand = [
    'BusinessRelationInfo',
    'BusinessRelationInfo.Phones',
    'BusinessRelationInfo.Emails',
    'BusinessRelationInfo.Addresses',
    'BusinessRelationInfo.DefaultEmail',
    'BusinessRelationInfo.DefaultPhone',
    'BusinessRelationInfo.ShippingAddress',
    'BusinessRelationInfo.InvoiceAddress'
].join(',');

@Injectable()
export class PeopleService {
    oneHasMoreThan50 = false;
    constructor(
        private customerService: CustomerService,
        private supplierService: SupplierService,
        private contactService: ContactService,
        private employeeService: EmployeeService,
        private workerService: WorkerService,
    ) {

    }

    getPeople(urlParams: HttpParams, searchString) {
        return Observable.forkJoin(
            this.getCustomers(urlParams),
            this.getSuppliers(urlParams),
            this.getContacts(urlParams),
            this.getWorkers(urlParams),
            this.getEmployees(urlParams, searchString)
        )
            .do(x => {
                this.oneHasMoreThan50 = false;
                x.forEach((data) => {
                    if (data.length === 50) {
                        this.oneHasMoreThan50 = true;
                    }
                });
            })
            .map(x => [].concat.apply([], x));
    }

    getCustomers(urlParams: HttpParams) {
        let params = urlParams || new HttpParams();
        params = params
            .set('expand', expand)
            .set('hateoas', 'false')
            .set('top', '50');

        return this.customerService.GetAllByHttpParams(params)
            .map(x => x.body)
            .map(x => x.map(y => {
                y._Source = 'Customer';
                return y;
            }));
    }

    getSuppliers(urlParams: HttpParams) {
        let params = urlParams || new HttpParams();
        params = params
            .set('expand', expand)
            .set('hateoas', 'false')
            .set('top', '50');

        return this.supplierService.GetAllByHttpParams(params)
            .map(x => x.body)
            .map(x => x.map(y => {
                y._Source = 'Supplier';
                return y;
            }));
    }

    getContacts(urlParams: HttpParams) {
        let params = urlParams || new HttpParams();
        params = params
            .set('expand', expand)
            .set('hateoas', 'false')
            .set('top', '50');

        return this.contactService.GetAllByHttpParams(params)
            .map(x => x.body)
            .map(x => x.map(y => {
                y._Source = 'Contact';
                return y;
            }));
    }

    getWorkers(urlParams: HttpParams) {
        let params = urlParams || new HttpParams();
        params = params
            .set('expand', expand)
            .set('hateoas', 'false')
            .set('top', '50');
        return this.workerService.GetAllByHttpParams(params)
            .map(x => x.body)
            .map(x => x.map(y => {
                y._Source = 'Worker';
                return y;
            }));
    }

    getEmployees(urlParams: HttpParams, searchString) {
        let params = urlParams || new HttpParams();
        params = params
            .set('expand', employeesExpand)
            .set('hateoas', 'false')
            .set('orderby', 'BusinessRelationInfo.Name')
            .set('top', '50');

        if (params.has('filter')) {
            let filter = params.get('filter');
            filter = filter.replace(new RegExp('Info.', 'g'), 'BusinessRelationInfo.');
            filter += ` or startswith(SocialSecurityNumber, '${searchString}')`;
            params = params.set('filter', filter);

        }
        return this.employeeService.GetAllByHttpParams(params)
            .map(x => x.body)
            .map(x => x.map(y => {
                y._Source = 'Employee';
                y.Info = y.BusinessRelationInfo;
                return y;
            }));
    }
}
