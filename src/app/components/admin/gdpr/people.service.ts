import {Injectable} from '@angular/core';
import {CustomerService} from '@app/services/sales/customerService';
import {URLSearchParams} from '@angular/http';
import { SupplierService } from '@app/services/accounting/supplierService';
import { Observable } from 'rxjs/Observable';
import { ContactService } from '@app/services/common/contactService';
import { EmployeeService } from '@app/services/salary/employee/employeeService';
import { WorkerService } from '@app/services/timetracking/workerService';

@Injectable()
export class PeopleService {
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
        ).map(x => [].concat.apply([], x));
    }

    getCustomers(urlParams: URLSearchParams) {
        const params = urlParams || new URLSearchParams();
        const expand = [
            'Info',
            'Info.DefaultEmail',
            'Info.DefaultPhone'
        ].join(',');
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
        const expand = [
            'Info',
            'Info.DefaultEmail',
            'Info.DefaultPhone'
        ].join(',');
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
        const expand = [
            'Info',
            'Info.DefaultEmail',
            'Info.DefaultPhone'
        ].join(',');
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
        const expand = [
            'Info',
            'Info.DefaultEmail',
            'Info.DefaultPhone'
        ].join(',');
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
        const expand = [
            'BusinessRelationInfo',
            'BusinessRelationInfo.DefaultEmail',
            'BusinessRelationInfo.DefaultPhone'
        ].join(',');
        params.set('expand', expand);
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
