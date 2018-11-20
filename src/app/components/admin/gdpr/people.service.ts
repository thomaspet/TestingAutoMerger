import {Injectable} from '@angular/core';
import {CustomerService} from '@app/services/sales/customerService';
import {URLSearchParams} from '@angular/http';
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

    getPeople(urlParams: URLSearchParams, searchString) {
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

    getCustomers(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        params.set('expand', expand);
        params.set('hateoas', 'false');
        params.set('top', '50');
        return this.customerService.GetAllByUrlSearchParams(params)
            .map(x => x.json())
            .map(x => x.map(y => {
                y._Source = 'Customer';
                return y;
            }));
    }

    getSuppliers(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        params.set('expand', expand);
        params.set('hateoas', 'false');
        params.set('top', '50');
        return this.supplierService.GetAllByUrlSearchParams(params)
            .map(x => x.json())
            .map(x => x.map(y => {
                y._Source = 'Supplier';
                return y;
            }));
    }

    getContacts(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        params.set('expand', expand);
        params.set('hateoas', 'false');
        params.set('top', '50');
        return this.contactService.GetAllByUrlSearchParams(params)
            .map(x => x.json())
            .map(x => x.map(y => {
                y._Source = 'Contact';
                return y;
            }));
    }

    getWorkers(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        params.set('expand', expand);
        params.set('hateoas', 'false');
        params.set('top', '50');
        return this.workerService.GetAllByUrlSearchParams(params)
            .map(x => x.json())
            .map(x => x.map(y => {
                y._Source = 'Worker';
                return y;
            }));
    }

    getEmployees(urlParams: URLSearchParams, searchString) {
        const params = urlParams || new URLSearchParams();
        params.set('expand', employeesExpand);
        params.set('hateoas', 'false');
        params.set('orderby', 'BusinessRelationInfo.Name');
        params.set('top', '50');
        if (params.has('filter')) {
            let filter = params.get('filter');
            filter = filter.replace(new RegExp('Info.', 'g'), 'BusinessRelationInfo.');
            filter += ` or startswith(SocialSecurityNumber, '${searchString}')`;
            params.set('filter', filter);

        }
        return this.employeeService.GetAllByUrlSearchParams(params)
            .map(x => x.json())
            .map(x => x.map(y => {
                y._Source = 'Employee';
                y.Info = y.BusinessRelationInfo;
                return y;
            }));
    }
}
