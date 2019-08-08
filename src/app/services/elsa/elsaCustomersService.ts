import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaCustomer} from '@app/models';

@Injectable()
export class ElsaCustomersService {
    constructor(private uniHttp: UniHttp) {}

    getByContractID(contractID: number, expand?: string): Observable<ElsaCustomer> {
        let endpoint = `/api/elsa/contracts/${contractID}/customers`;
        if (expand) {
            endpoint += '?expand=' + expand;
        }
        return this.uniHttp.asGET()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.body);
    }

    get(id: number): Observable<ElsaCustomer> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/customers/${id}`)
            .send()
            .map(res => res.body);
    }

    getAll(expand?: string): Observable<ElsaCustomer[]> {
        let endpoint = '/api/elsa/customers';
        if (expand) {
            endpoint += '?expand=' + expand;
        }

        return this.uniHttp.asGET()
            .usingEmptyDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.body);
    }

    put(customer: ElsaCustomer) {
        return this.uniHttp.asPUT()
            .usingElsaDomain()
            .withEndPoint(`/api/customers/${customer.ID}`)
            .withBody(customer)
            .send();
    }

    addAdmin(customerID: number, email: string) {
        return this.uniHttp.asPOST()
            .usingElsaDomain()
            .withEndPoint(`/api/customers/${customerID}/customer-access`)
            .withBody(email)
            .send()
            .map(res => res.body);
    }

    removeAdmin(customerID: number, id: number) {
        return this.uniHttp.asDELETE()
            .usingElsaDomain()
            .withEndPoint(`/api/customers/${customerID}/customer-access/${id}`)
            .send()
            .map(res => res.body);
    }
}
