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
            .map(res => res.json());
    }

    get(id: number): Observable<ElsaCustomer> {
        return this.uniHttp
            .asGET()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/customers/${id}`)
            .send()
            .map(res => res.json());
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
            .map(res => res.json());
    }

    put(customer: ElsaCustomer) {
        return this.uniHttp.asPUT()
            .usingEmptyDomain()
            .withEndPoint(`/api/elsa/customers/${customer.ID}`)
            .withBody(customer)
            .send();
    }
}
